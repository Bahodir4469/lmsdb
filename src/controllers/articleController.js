const articleService = require('../services/articleService');
const path = require('path');
const fs = require('fs');
const getBaseUrl = require('../utils/getBaseUrl');

const getArticles = async (req, res) => {
  try {
    const articles = await articleService.getAllArticles();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;
    const baseUrl = getBaseUrl(req);
    let imageUrl;

    // Agar fayl sifatida kelsa
    if (req.file) {
      const relativePath = path.relative(
        path.join(__dirname, '../../uploads'),
        req.file.path
      );
      imageUrl = `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;
    }
    // Agar text URL sifatida kelsa
    else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    const article = await articleService.createArticle({ title, content, imageUrl });
    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ error: 'Maqola yaratib bo‘lmadi', details: err.message });
  }
};


const getArticle = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const article = await articleService.getArticleById(id);
    if (!article) return res.status(404).json({ error: 'Maqola topilmadi' });
    res.json(article);
  } catch (err) {
    res.status(400).json({ error: 'Server error', details: err.message });
  }
};

const updateArticle = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const baseUrl = getBaseUrl(req);
    let imageUrl;

    // Eski maqolani olamiz
    const oldArticle = await articleService.getArticleById(id);
    if (!oldArticle) {
      return res.status(404).json({ error: 'Maqola topilmadi' });
    }

    // 1. Agar fayl bo‘lsa – eski faylni o‘chir, yangi URL yarat
    if (req.file) {
      // Eski faylni o‘chirish
      if (oldArticle.imageUrl?.includes('/uploads/')) {
        const filePath = path.join(
          __dirname,
          '../../uploads',
          oldArticle.imageUrl.split('/uploads/')[1]
        );
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      const relativePath = path.relative(
        path.join(__dirname, '../../uploads'),
        req.file.path
      );
      imageUrl = `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;
    }

    // 2. Agar text URL kelsa
    else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    const updatedArticle = await articleService.updateArticle(id, {
      ...req.body,
      imageUrl
    });

    res.json(updatedArticle);
  } catch (err) {
    res.status(400).json({ error: 'Update failed', details: err.message });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const article = await articleService.getArticleById(id);

    if (!article) return res.status(404).json({ error: 'Maqola topilmadi' });

    // Faylni o‘chirish
    if (article.imageUrl?.includes('/uploads/')) {
      const filePath = path.join(
        __dirname,
        '../../uploads',
        article.imageUrl.split('/uploads/')[1]
      );
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await articleService.deleteArticle(id);
    res.json({ message: 'Maqola o‘chirildi' });
  } catch (err) {
    res.status(400).json({ error: 'Delete failed', details: err.message });
  }
};

module.exports = {
  getArticles,
  createArticle,
  getArticle,
  updateArticle,
  deleteArticle
};
