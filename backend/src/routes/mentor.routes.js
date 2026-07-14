const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { generateLeavePDF } = require('../utils/pdfGenerator');
const nodemailer = require('nodemailer');

const router = express.Router();
const prisma = new PrismaClient();

// Setup Ethereal Email for testing
let transporter;
nodemailer.createTestAccount((err, account) => {
    if (account) {
        transporter = nodemailer.createTransport({
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: { user: account.user, pass: account.pass }
        });
    }
});

router.use(authenticate, authorize(['Mentor']));

// Get Leaves for assigned Department & Section
router.get('/leaves', async (req, res) => {
  try {
    const leaves = await prisma.leave.findMany({
      where: {
        department: req.user.department,
        section: req.user.section
      },
      include: { student: true },
      orderBy: { applied_at: 'desc' }
    });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve Leave
router.post('/leave/:id/approve', async (req, res) => {
  try {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const refNo = `REF-${dateStr}-${req.params.id}`;
    const leave = await prisma.leave.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        status: 'Approved', 
        remarks: req.body.remarks, 
        approved_at: new Date(),
        approved_by: req.user.name,
        approval_reference_no: refNo
      },
      include: { student: true }
    });

    await prisma.notification.create({
      data: {
        student_id: leave.student_id,
        message: `Your leave request for ${leave.leave_type} (${leave.from_date} to ${leave.to_date}) has been Approved.`
      }
    });

    if (transporter) {
      try {
        const pdfBuffer = await generateLeavePDF(leave);
        const info = await transporter.sendMail({
          from: '"Smart Leave System" <noreply@college.edu>',
          to: leave.student.email,
          subject: 'Leave Approval Letter',
          text: 'Your leave has been approved. Please find the approval letter attached.',
          attachments: [
            {
              filename: `Leave_Approval_${leave.approval_reference_no}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        });
        console.log('Email sent! Preview URL: %s', nodemailer.getTestMessageUrl(info));
      } catch (err) {
        console.error('Failed to send email:', err);
      }
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject Leave
router.post('/leave/:id/reject', async (req, res) => {
  try {
    const leave = await prisma.leave.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Rejected', remarks: req.body.remarks, approved_at: new Date() },
      include: { student: true }
    });

    await prisma.notification.create({
      data: {
        student_id: leave.student_id,
        message: `Your leave request for ${leave.leave_type} (${leave.from_date} to ${leave.to_date}) has been Rejected. Remarks: ${req.body.remarks || 'None'}`
      }
    });

    res.json(leave);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  const baseQuery = { department: req.user.department, section: req.user.section };
  const pending = await prisma.leave.count({ where: { ...baseQuery, status: 'Pending' } });
  const approved = await prisma.leave.count({ where: { ...baseQuery, status: 'Approved' } });
  const rejected = await prisma.leave.count({ where: { ...baseQuery, status: 'Rejected' } });
  res.json({ pending, approved, rejected });
});

module.exports = router;
