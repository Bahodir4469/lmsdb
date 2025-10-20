const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const submitTest = async (userId, testId, answer) => {
  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test) throw new Error('Test topilmadi');

  const isCorrect = test.correctAnswer === answer;

  // statistikaga yozish
  await prisma.testStat.update({
    where: { testId },
    data: {
      totalAttempts: { increment: 1 },
      correctAttempts: isCorrect ? { increment: 1 } : undefined
    }
  });

  return await prisma.testResult.create({
    data: {
      userId,
      testId,
      answer,
      isCorrect
    }
  });
};

module.exports = {
  submitTest
};
