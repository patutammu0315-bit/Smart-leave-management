const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Verify Leave Letter via QR Code
router.get('/verify-leave/:ref_no', async (req, res) => {
  try {
    const leave = await prisma.leave.findUnique({
      where: { approval_reference_no: req.params.ref_no },
      include: { student: { select: { name: true, student_id: true, department: true } } }
    });

    if (!leave) {
      return res.status(404).send('<h1>Leave Record Not Found</h1><p>The provided reference number is invalid or the leave record has been deleted.</p>');
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Leave Verification</title>
        <style>
          body { font-family: sans-serif; background: #f3f4f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
          .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 500px; width: 100%; border-top: 4px solid #16a34a; }
          h1 { color: #16a34a; margin-top: 0; }
          .row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: bold; color: #4b5563; }
          .value { color: #1f2937; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>✅ Leave Verified</h1>
          <p>This is a valid leave approval record issued by the Smart Leave Management System.</p>
          <div class="row"><span class="label">Reference No:</span> <span class="value">${leave.approval_reference_no}</span></div>
          <div class="row"><span class="label">Student Name:</span> <span class="value">${leave.student.name}</span></div>
          <div class="row"><span class="label">Student ID:</span> <span class="value">${leave.student.student_id}</span></div>
          <div class="row"><span class="label">Leave Type:</span> <span class="value">${leave.leave_type}</span></div>
          <div class="row"><span class="label">Dates:</span> <span class="value">${leave.from_date} to ${leave.to_date}</span></div>
          <div class="row"><span class="label">Status:</span> <span class="value" style="color: #16a34a; font-weight: bold;">${leave.status}</span></div>
          <div class="row"><span class="label">Approved By:</span> <span class="value">${leave.approved_by || 'Mentor'}</span></div>
        </div>
      </body>
      </html>
    `;
    res.send(html);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
