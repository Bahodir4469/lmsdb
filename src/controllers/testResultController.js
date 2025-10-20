const testResultService = require('../services/testResultService');

const submit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { testId, answer } = req.body;

    const result = await testResultService.submitTest(userId, testId, answer);
    res.status(201).json(result);
  } catch (err) {
    res
      .status(400)
      .json({ error: 'Javob topshirilmadi', details: err.message });
  }
};

module.exports = {
  submit
};
