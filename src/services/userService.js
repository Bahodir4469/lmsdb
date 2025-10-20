const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      surname: true,
      login_name: true,
      email: true,
      role: true,
      registeredAt: true,
      isActive: true
    }
  });
};

const createUser = async (data) => {
  // Tekshir: login_name yoki email allaqachon mavjudmi?
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ login_name: data.login_name }, { email: data.email }]
    }
  });

  if (existing) {
    throw new Error('Login name yoki email allaqachon mavjud');
  }

  return await prisma.user.create({ data });
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({ where: { id } });
};

const updateUser = async (id, data) => {
  return await prisma.user.update({
    where: { id },
    data
  });
};

const deleteUser = async (id) => {
  return await prisma.user.delete({ where: { id } });
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser
};
