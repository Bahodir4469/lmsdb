const express = require('express');
const router = express.Router();
const {
  deleteMaterial,
  createMaterial,
  updateMaterial
} = require('../controllers/materialController');
const verifyToken = require('../middlewares/authMiddleware');
const hasRole = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.post(
  '/',
  verifyToken,
  hasRole('admin', 'teacher'),
  upload.single('file'),
  createMaterial
);

router.patch(
  '/:id',
  verifyToken,
  hasRole('admin', 'teacher'),
  upload.single('file'),
  updateMaterial
);

router.delete('/:id', verifyToken, hasRole('admin', 'teacher'), deleteMaterial);

module.exports = router;

module.exports = router;
