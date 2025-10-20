const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const login = async (req, res) => {
  try {
    const { login_name, password } = req.body;

    const user = await prisma.user.findUnique({ where: { login_name } });

    if (!user) {
      return res.status(400).json({ error: 'Login name yoki parol noto‘g‘ri' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Login name yoki parol noto‘g‘ri' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    delete user.password;
    res.json({ token, user });
  } catch {
    return res
      .status(401)
      .json({ error: 'Token noto‘g‘ri yoki muddati tugagan' });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, surname, login_name, email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ login_name }, { email }]
      }
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'Login yoki email allaqachon mavjud' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        surname,
        login_name,
        email,
        password: hashedPassword,
        role: 'student', // default
        isActive: true
      }
    });

    delete newUser.password;
    const userData = newUser;

    res.status(201).json({ user: userData });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Foydalanuvchini yaratib bo‘lmadi' });
  }
};

const me = async (req, res) => {
  try {
    const userData = { ...req.user };
    delete userData.password;
    res.json(userData);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const crypto = require('crypto');

// xotirada vaqtincha token saqlaymiz (real loyihada DB yoki redisda)
const resetTokens = new Map();

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(404).json({ error: 'Email topilmadi' });

  const token = crypto.randomBytes(32).toString('hex');
  resetTokens.set(token, {
    userId: user.id,
    expires: Date.now() + 15 * 60 * 1000
  }); // 15 daqiqa

  // Real loyihada email jo‘natiladi
  res.json({
    message: 'Reset link yuborildi',
    resetToken: token // test uchun qaytaramiz
  });
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const data = resetTokens.get(token);

  if (!data || Date.now() > data.expires) {
    return res
      .status(400)
      .json({ error: 'Token noto‘g‘ri yoki muddati tugagan' });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: data.userId },
    data: { password: hashed }
  });

  resetTokens.delete(token);
  res.json({ message: 'Parol muvaffaqiyatli tiklandi' });
};

module.exports = {
  login,
  me,
  requestPasswordReset,
  resetPassword,
  registerUser
};
