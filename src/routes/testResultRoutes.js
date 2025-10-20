const express = require('express');
const router = express.Router();
const controller = require('../controllers/testResultController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/submit', verifyToken, controller.submit);

module.exports = router;
