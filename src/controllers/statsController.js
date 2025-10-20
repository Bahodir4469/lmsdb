const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const userStats = async (req, res) => {
  try {
    const total = await prisma.user.count();
    const active = await prisma.user.count({ where: { isActive: true } });
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsers = await prisma.user.count({
      where: { registeredAt: { gte: weekAgo } }
    });

    res.json({
      total_users: total,
      active_users: active,
      new_users: newUsers
    });
  } catch (err) {
    res.status(500).json({ error: 'User stats error', details: err.message });
  }
};

const lessonStats = async (req, res) => {
  try {
    const total = await prisma.lesson.count();

    // completed_lessons va views bo‘lmasa, taxminiy qiymat
    const completedLessons = 0;

    const popularLessons = await prisma.lesson.findMany({
      take: 3,
      orderBy: { id: 'desc' } // agar views bo‘lsa, o‘rniga `views` qo‘yamiz
    });

    res.json({
      total_lessons: total,
      completed_lessons: completedLessons,
      popular_lessons: popularLessons
    });
  } catch (err) {
    res.status(500).json({ error: 'Lesson stats error', details: err.message });
  }
};

const testStats = async (req, res) => {
  try {
    const total = await prisma.test.count();

    const averageScore = 0; // hali result tracking qilinmagan

    const mostAttempted = await prisma.test.findMany({
      include: {
        statistics: true
      },
      orderBy: {
        statistics: {
          totalAttempts: 'desc'
        }
      },
      take: 3
    });

    res.json({
      total_tests: total,
      average_score: averageScore,
      most_attempted_tests: mostAttempted
    });
  } catch (err) {
    res.status(500).json({ error: 'Test stats error', details: err.message });
  }
};

module.exports = {
  userStats,
  lessonStats,
  testStats
};
