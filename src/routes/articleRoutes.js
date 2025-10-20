const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const verifyToken = require('../middlewares/authMiddleware');
const hasRole = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', articleController.getArticles);
router.get('/:id', articleController.getArticle);

router.post(
  '/',
  verifyToken,
  hasRole('admin', 'editor'),
  upload.single('imageUrl'),
  articleController.createArticle
);

router.put(
  '/:id',
  verifyToken,
  hasRole('admin', 'editor'),
  upload.single('imageUrl'), // imageUrl — bu fayl bo'lishi ham mumkin
  articleController.updateArticle
);

router.delete(
  '/:id',
  verifyToken,
  hasRole('admin'),
  articleController.deleteArticle
);

module.exports = router;
