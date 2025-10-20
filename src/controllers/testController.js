const testService = require('../services/testService');

const getLessonTestSummaries = async (req, res) => {
  try {
    const summaries = await testService.getLessonTestSummaries();
    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const getTests = async (req, res) => {
  try {
    const lessonId = req.query.lessonId;

    if (!lessonId) {
      return res
        .status(400)
        .json({ error: 'lessonId query parametresi kerak' });
    }

    const tests = await testService.getTestsByLesson(parseInt(lessonId));
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const getTestById = async (req, res) => {
  try {
    const testId = parseInt(req.params.id);
    if (isNaN(testId)) {
      return res.status(400).json({ error: "Noto‘g‘ri test ID" });
    }

    const test = await testService.getTestById(testId);

    if (!test) {
      return res.status(404).json({ error: "Test topilmadi" });
    }

    res.status(200).json(test);
  } catch (err) {
    console.error("Xatolik getTestById:", err);
    res.status(500).json({
      error: "Serverda xatolik yuz berdi",
      details: err.message,
    });
  }
};
const createTest = async (req, res) => {
  try {
    const { lessonId, question, options, correctAnswer } = req.body;

    if (!lessonId || !question || !options || !correctAnswer) {
      return res
        .status(400)
        .json({ error: 'Hamma maydonlar to‘ldirilishi shart' });
    }

    const test = await testService.createTest({
      lessonId,
      question,
      options,
      correctAnswer
    });

    res.status(201).json(test);
  } catch (err) {
    res
      .status(400)
      .json({ error: 'Test creation failed', details: err.message });
  }
};

const submitTest = async (req, res) => {
  try {
    const { testId, selectedAnswer } = req.body;
    const userId = req.user.id;

    const result = await testService.submitTest({
      userId,
      testId,
      selectedAnswer
    });

    res.status(201).json(result);
  } catch (err) {
    res
      .status(400)
      .json({ error: 'Test submission failed', details: err.message });
  }
};

const getUserResults = async (req, res) => {
  try {
    const userId = req.user.id;
    const results = await testService.getResultsByUser(userId);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
const updateTest = async (req, res) => {
  const { id } = req.params;
  const { question, options, correctAnswer, timeLimit } = req.body;

  try {
    const updatedTest = await testService.updateTest(Number(id), {
      question,
      options,
      correctAnswer,
      timeLimit,
    });

    res.json(updatedTest);
  } catch (error) {
    console.error("Error updating test:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};


const deleteTest = async (req, res) => {
  try {
    const testId = parseInt(req.params.id);
    await testService.deleteTest(testId);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Test delete failed', details: err.message });
  }
};

module.exports = {
  getTests,
  getTestById,
  createTest,
  submitTest,
  getUserResults,
  getLessonTestSummaries,
  updateTest,
  deleteTest
};
