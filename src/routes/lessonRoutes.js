const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const verifyToken = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');
const hasRole = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', verifyToken, lessonController.getLessons);
router.get('/:id', verifyToken, lessonController.getLesson);
router.post(
  '/',
  verifyToken,
  hasRole('admin', 'teacher'),
  upload.fields([
    { name: 'video_file', maxCount: 1 },
    { name: 'materials', maxCount: 10 } // agar birdan ortiq file bo‘lsa
  ]),
  lessonController.createLesson
);
router.put(
  '/:id',
  verifyToken,
  hasRole('admin', 'teacher'),
  upload.fields([
    { name: 'video_file', maxCount: 1 },
    { name: 'materials', maxCount: 10 } // agar birdan ortiq file bo‘lsa
  ]),
  lessonController.updateLesson
);

router.delete('/:id', verifyToken, adminOnly, lessonController.deleteLesson);

module.exports = router;
