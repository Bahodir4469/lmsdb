const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const initAdmin = async () => {
  const userCount = await prisma.user.count();

  if (userCount > 0) {
    console.log('ℹ️  Foydalanuvchi mavjud, admin yaratilmadi');
    return;
  }

  const hashedPassword = await bcrypt.hash(process.env.INIT_ADMIN_PASSWORD, 10);

  await prisma.user.create({
    data: {
      name: process.env.INIT_ADMIN_NAME,
      surname: process.env.INIT_ADMIN_SURNAME,
      login_name: process.env.INIT_ADMIN_LOGIN,
      email: process.env.INIT_ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      isActive: true
    }
  });

  console.log('✅ Super admin user yaratildi');
};

module.exports = initAdmin;
