const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');

// CRUD himoyalangan
router.get('/', verifyToken, adminOnly, userController.getUsers);
router.get('/:id', verifyToken, userController.getUser);
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, adminOnly, userController.deleteUser);

// POST /api/users – 1-foydalanuvchi avtomatik super admin, qolganlar token + adminOnly orqali yaratiladi
router.post('/', verifyToken, adminOnly, userController.createUser);

module.exports = router;
