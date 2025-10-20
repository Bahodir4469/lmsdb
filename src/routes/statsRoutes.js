const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const verifyToken = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');

router.get('/users', verifyToken, adminOnly, statsController.userStats);
router.get('/lessons', verifyToken, adminOnly, statsController.lessonStats);
router.get('/tests', verifyToken, adminOnly, statsController.testStats);

module.exports = router;
