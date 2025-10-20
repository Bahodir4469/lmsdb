const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const autoPublish = async () => {
  const now = new Date();

  // maqolalarni tekshirish
  await prisma.article.updateMany({
    where: {
      publishAt: { lte: now },
      isPublished: false
    },
    data: { isPublished: true }
  });

  // darslarni tekshirish
  await prisma.lesson.updateMany({
    where: {
      publishAt: { lte: now },
      isPublished: false
    },
    data: { isPublished: true }
  });
};

module.exports = autoPublish;
