const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const verifyToken = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');

router.get('/', verifyToken, testController.getTests); // ?lessonId=1 bo'yicha testlar
router.get('/summary', verifyToken, testController.getLessonTestSummaries); // barcha darslar va testlar soni
router.get('/:id', verifyToken, testController.getTestById);
router.post('/', verifyToken, adminOnly, testController.createTest);
router.post('/submit', verifyToken, testController.submitTest); // testga javob topshirish
router.get('/results/me', verifyToken, testController.getUserResults); // foydalanuvchining barcha natijalari
router.put('/:id', verifyToken, adminOnly, testController.updateTest);
router.delete('/:id', verifyToken, adminOnly, testController.deleteTest);
module.exports = router;
