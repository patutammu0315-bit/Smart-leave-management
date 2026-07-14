const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'rajeshstudyemail0315@gmail.com';
  const password = 'rajesh@0315';
  
  const existingAdmin = await prisma.admin.findUnique({ where: { email } });
  
  if (!existingAdmin) {
    const password_hash = await bcrypt.hash(password, 10);
    await prisma.admin.create({
      data: {
        name: 'System Admin',
        email,
        password_hash,
      },
    });
    console.log('Admin user seeded successfully!');
  } else {
    console.log('Admin user already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
