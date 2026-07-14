const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed workflow users...');
  
  // 1. Create a Mentor for CSE Department, Section A
  const mentorEmail = 'mentor.cse.a@example.com';
  const mentorPassword = await bcrypt.hash('mentor123', 10);
  
  let mentor = await prisma.mentor.findUnique({ where: { email: mentorEmail } });
  if (!mentor) {
    mentor = await prisma.mentor.create({
      data: {
        name: 'John Doe (Mentor)',
        email: mentorEmail,
        password_hash: mentorPassword,
        phone: '1234567890',
        designation: 'Assistant Professor',
        department: 'CSE',
        section: 'A'
      }
    });
    console.log('Created Mentor:', mentorEmail, '| Password: mentor123 | Dept: CSE, Sec: A');
  } else {
    console.log('Mentor already exists:', mentorEmail);
  }

  // 2. Create a Student for CSE Department, Section A
  const studentEmail = 'student.cse.a@example.com';
  const studentPassword = await bcrypt.hash('student123', 10);
  
  let student = await prisma.student.findUnique({ where: { email: studentEmail } });
  if (!student) {
    student = await prisma.student.create({
      data: {
        student_id: 'STU1001',
        name: 'Jane Smith (Student)',
        email: studentEmail,
        password_hash: studentPassword,
        department: 'CSE',
        section: 'A'
      }
    });
    console.log('Created Student:', studentEmail, '| Password: student123 | Dept: CSE, Sec: A');
  } else {
    console.log('Student already exists:', studentEmail);
  }
  
  console.log('Workflow Users Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
