const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { generateLeavePDF } = require('../utils/pdfGenerator');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate, authorize(['Student']));

// Apply Leave
router.post('/apply', async (req, res) => {
  const { leave_type, from_date, to_date, reason } = req.body;
  try {
    const leave = await prisma.leave.create({
      data: {
        student_id: req.user.id,
        department: req.user.department,
        section: req.user.section,
        leave_type,
        from_date,
        to_date,
        reason,
      }
    });
    res.json(leave);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get My Leaves
router.get('/history', async (req, res) => {
  try {
    const leaves = await prisma.leave.findMany({
      where: { student_id: req.user.id },
      orderBy: { applied_at: 'desc' }
    });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Stats
router.get('/dashboard', async (req, res) => {
  const total = await prisma.leave.count({ where: { student_id: req.user.id } });
  const approved = await prisma.leave.count({ where: { student_id: req.user.id, status: 'Approved' } });
  const pending = await prisma.leave.count({ where: { student_id: req.user.id, status: 'Pending' } });
  const rejected = await prisma.leave.count({ where: { student_id: req.user.id, status: 'Rejected' } });
  res.json({ total, approved, pending, rejected });
});

// Download Leave Approval Letter
router.get('/leave/:id/download-letter', async (req, res) => {
  try {
    const leave = await prisma.leave.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { student: true }
    });

    if (!leave) return res.status(404).json({ error: 'Leave request not found' });
    if (leave.student_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized access to leave letter' });
    if (leave.status !== 'Approved') return res.status(400).json({ error: 'Leave request is not approved' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Leave_Approval_${leave.student.student_id}_${leave.from_date}.pdf`);

    await generateLeavePDF(leave, res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get Notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { student_id: req.user.id },
      orderBy: { created_at: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark Notification as Read
router.post('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: parseInt(req.params.id) },
      data: { is_read: true }
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
