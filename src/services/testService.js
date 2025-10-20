const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getLessonTestSummaries = async () => {
  const summaries = await prisma.test.groupBy({
    by: ['lessonId'],
    _count: { lessonId: true }
  });

  const lessons = await prisma.lesson.findMany({
    where: {
      id: { in: summaries.map((s) => s.lessonId) }
    },
    select: {
      id: true,
      title: true
    }
  });

  return lessons.map((lesson) => {
    const summary = summaries.find((s) => s.lessonId === lesson.id);
    return {
      lessonId: lesson.id,
      title: lesson.title,
      testCount: summary?._count.lessonId || 0
    };
  });
};
const getTestsByLesson = async (lessonId) => {
  return await prisma.test.findMany({
    where: { lessonId: Number(lessonId) },
    include: {
      stat: true // ✅ bu modeldagi to‘g‘ri nom
    }
  });
};
const createTest = async (data) => {
  const test = await prisma.test.create({ data });

  await prisma.testStat.create({
    data: { testId: test.id }
  });

  return test;
};

const getTestById = async (id) => {
  return await prisma.test.findUnique({
    where: { id },
  });
};

const submitTest = async ({ userId, testId, selectedAnswer }) => {
  const test = await prisma.test.findUnique({ where: { id: testId } });

  if (!test) throw new Error('Test not found');

  const isCorrect = test.correctAnswer === selectedAnswer;

  const result = await prisma.testResult.create({
    data: {
      userId,
      testId,
      selectedAnswer,
      isCorrect
    }
  });

  return {
    testId,
    selectedAnswer,
    correctAnswer: test.correctAnswer,
    isCorrect
  };
};

const getResultsByUser = async (userId) => {
  return await prisma.testResult.findMany({
    where: { userId },
    include: {
      test: true
    }
  });
};
const updateTest = async (id, data) => {
  return await prisma.test.update({
    where: { id },
    data
  });
};

const deleteTest = async (id) => {
  return await prisma.test.delete({
    where: { id }
  });
};

module.exports = {
  getTestsByLesson,
  createTest,
  getTestById,
  submitTest,
  getResultsByUser,
  getLessonTestSummaries,
  updateTest,
  deleteTest
};
