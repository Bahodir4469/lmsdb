const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllArticles = async () => {
  return prisma.article.findMany();
};

const createArticle = async (data) => {
  return prisma.article.create({ data });
};

const getArticleById = async (id) => {
  // views += 1 qilamiz
  await prisma.article.update({
    where: { id },
    data: { views: { increment: 1 } }
  });

  return prisma.article.findUnique({ where: { id } });
};

const updateArticle = async (id, data) => {
  return prisma.article.update({
    where: { id },
    data
  });
};

const deleteArticle = async (id) => {
  return prisma.article.delete({
    where: { id }
  });
};

module.exports = {
  getAllArticles,
  createArticle,
  getArticleById,
  updateArticle,
  deleteArticle
};
