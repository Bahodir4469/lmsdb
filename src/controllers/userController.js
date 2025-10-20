const bcrypt = require('bcryptjs');
const userService = require('../services/userService');

const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error('Xatolik getUsers da:', err); // ✅ log qo‘shildi
    res.status(500).json({ error: 'Server error' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, surname, login_name, email, password, role } = req.body;

    const allUsers = await userService.getAllUsers();
    const isFirstUser = allUsers.length === 0;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userService.createUser({
      name,
      surname,
      login_name,
      email,
      password: hashedPassword,
      role: isFirstUser ? 'admin' : role
    });

    delete user.password;
    res.status(201).json(user);
  } catch (err) {
    res
      .status(400)
      .json({ error: 'User creation failed', details: err.message });
  }
};

const getUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await userService.getUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await userService.updateUser(id, req.body);
    delete updated.password;
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Update failed', details: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await userService.deleteUser(id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Delete failed', details: err.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
};
