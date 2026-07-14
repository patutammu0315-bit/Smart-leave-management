const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { authenticate, authorize } = require('../middleware/auth');
const { Parser } = require('json2csv');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate, authorize(['Admin']));

// Add Mentor
router.post('/mentors', async (req, res) => {
  const { name, email, password, phone, designation, department, section } = req.body;
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const mentor = await prisma.mentor.create({
      data: { name, email, password_hash, phone, designation, department, section }
    });
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all mentors
router.get('/mentors', async (req, res) => {
  const mentors = await prisma.mentor.findMany();
  res.json(mentors);
});

// Add Student
router.post('/students', async (req, res) => {
  const { name, email, student_id, password, department, section } = req.body;
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const student = await prisma.student.create({
      data: { name, email, student_id, password_hash, department, section }
    });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all students
router.get('/students', async (req, res) => {
  const students = await prisma.student.findMany();
  res.json(students);
});

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  const totalStudents = await prisma.student.count();
  const totalMentors = await prisma.mentor.count();
  const pendingLeaves = await prisma.leave.count({ where: { status: 'Pending' } });
  const approvedLeaves = await prisma.leave.count({ where: { status: 'Approved' } });
  
  res.json({ totalStudents, totalMentors, pendingLeaves, approvedLeaves });
});

// Get all leaves
router.get('/leaves', async (req, res) => {
  const leaves = await prisma.leave.findMany({ include: { student: true } });
  res.json(leaves);
});

// Export leaves report to CSV
router.get('/reports/export', async (req, res) => {
  try {
    const leaves = await prisma.leave.findMany({
      include: { student: true },
      orderBy: { applied_at: 'desc' }
    });

    const csvData = leaves.map(l => ({
      'Reference No': l.approval_reference_no || 'N/A',
      'Student Name': l.student.name,
      'Student ID': l.student.student_id,
      'Department': l.department,
      'Section': l.section,
      'Leave Type': l.leave_type,
      'From': l.from_date,
      'To': l.to_date,
      'Reason': l.reason,
      'Status': l.status,
      'Approved By': l.approved_by || 'N/A',
      'Applied At': new Date(l.applied_at).toLocaleDateString()
    }));

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leave_reports.csv');
    res.status(200).end(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
