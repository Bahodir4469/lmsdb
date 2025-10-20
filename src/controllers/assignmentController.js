const assignmentService = require('../services/assignmentService');
const path = require('path');
const getBaseUrl = require('../utils/getBaseUrl');

const getAssignments = async (req, res) => {
  try {
    const assignments = await assignmentService.getAllAssignments();
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { lessonId, description } = req.body;
    const baseUrl = getBaseUrl(req);
    const numericLessonId = parseInt(lessonId);

    if (isNaN(numericLessonId)) {
      return res.status(400).json({ error: "Noto'g'ri lessonId qiymati" });
    }

    let files = [];

    // ✅ 1. Fayllar yuklangan bo‘lsa
    if (req.files && req.files.length > 0) {
      const uploadedFiles = req.files.map((file) => {
        const relativePath = path.relative(
          path.join(__dirname, '../../uploads'),
          file.path
        );
        return `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;
      });
      files.push(...uploadedFiles);
    }

    // ✅ 2. files maydonida URL linklar bo‘lsa (json string yoki oddiy)
    if (req.body.files) {
      try {
        const parsed = JSON.parse(req.body.files);
        files.push(...(Array.isArray(parsed) ? parsed : [parsed]));
      } catch {
        files.push(req.body.files); // oddiy string bo‘lsa
      }
    }

    const assignment = await assignmentService.createAssignment({
      lessonId: numericLessonId,
      description,
      fileUrls: files
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error('Assignment creation error:', err);
    res.status(400).json({
      error: 'Assignment creation failed',
      details: err.message
    });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const userId = req.user.id;
    const description = req.body.description;
    const baseUrl = getBaseUrl(req);

    let fileUrl = null;

    // Multer orqali kelgan faylni serverga saqlash
    if (req.file) {
      const relativePath = path.relative(
        path.join(__dirname, '../../uploads'),
        req.file.path
      );
      fileUrl = `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;
    }

    // Agar fayl kelmagan bo‘lsa, frontenddan kelgan fileUrl ni olamiz (masalan: URL orqali yuborilgan)
    if (!fileUrl && req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
    }

    if (!fileUrl) {
      return res.status(400).json({ error: 'Fayl yoki URL yuborilishi kerak.' });
    }

    const submission = await assignmentService.submitAssignment(
      assignmentId,
      userId,
      fileUrl,
      description
    );

    res.status(201).json(submission);
  } catch (err) {
    console.error("Submit error:", err);
    res.status(400).json({
      error: 'Topshiriq yuborilmadi',
      details: err.message,
    });
  }
};

const updateAssignmentSubmission = async (req, res) => {
  try {
    const submissionId = parseInt(req.params.id);
    const userId = req.user.id;
    const description = req.body.description;
    const baseUrl = getBaseUrl(req);

    let fileUrl = null;

    if (req.file) {
      const relativePath = path.relative(
        path.join(__dirname, '../../uploads'),
        req.file.path
      );
      fileUrl = `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;
    }

    if (!fileUrl && req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
    }

    if (!fileUrl) {
      return res
        .status(400)
        .json({ error: 'Fayl yoki URL yuborilishi kerak.' });
    }

    const updated = await assignmentService.updateSubmission(
      submissionId,
      userId,
      fileUrl,
      description
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({
      error: 'Yuborilgan topshiriqni yangilab bo‘lmadi',
      details: err.message
    });
  }
};

const updateAssignmentStatus = async (req, res) => {
  try {    
    const assignmentId = parseInt(req.params.id);
    const { status } = req.body;
    
    const updated = await assignmentService.updateAssignmentStatus(
      assignmentId,
      status
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({
      error: 'Topshiriq holatini yangilab bo‘lmadi',
      details: err.message
    });
  }
};
const getAssignmentById = async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const assignment = await assignmentService.getAssignmentById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ error: 'Topshiriq topilmadi' });
    }

    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: 'Xatolik', details: err.message });
  }
};

const deleteSubmission = async (req, res) => {
  try {
    const submissionId = parseInt(req.params.id);
    const userId = req.user.id;

    const deleted = await assignmentService.deleteSubmission(submissionId, userId);

    if (!deleted) {
      return res.status(403).json({ error: 'Ruxsat yo‘q yoki topshiriq topilmadi' });
    }

    res.json({ message: 'Topshiriq yuborilishi o‘chirildi' });
  } catch (err) {
    res.status(500).json({ error: 'Xatolik', details: err.message });
  }
};
const deleteAssignment = async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);

    const deleted = await assignmentService.deleteAssignment(assignmentId);

    if (!deleted) {
      return res.status(404).json({ error: 'Topshiriq topilmadi' });
    }

    res.json({ message: 'Topshiriq o‘chirildi' });
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi', details: err.message });
  }
};
const updateAssignment = async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const { lessonId, description } = req.body;
    const baseUrl = getBaseUrl(req);

    let files = [];

    // 1. Yuklangan fayllarni URL qilib olamiz
    if (req.files && req.files.length > 0) {
      const uploadedFiles = req.files.map((file) => {
        const relativePath = path.relative(
          path.join(__dirname, '../../uploads'),
          file.path
        );
        return `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;
      });
      files.push(...uploadedFiles);
    }

    // 2. Qo‘shimcha file URL’lar body’dan kelgan bo‘lishi mumkin
    if (req.body.files) {
      try {
        const parsed = JSON.parse(req.body.files);
        files.push(...(Array.isArray(parsed) ? parsed : [parsed]));
      } catch {
        files.push(req.body.files);
      }
    }

    const updated = await assignmentService.updateAssignment(assignmentId, {
      lessonId: parseInt(lessonId),
      description,
      fileUrls: files
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({
      error: 'Topshiriqni yangilashda xatolik',
      details: err.message
    });
  }
};
module.exports = {
  getAssignments,
  createAssignment,
  submitAssignment,
  updateAssignmentSubmission,
  updateAssignmentStatus,
  getAssignmentById,
  deleteSubmission,
  deleteAssignment,
  updateAssignment
};
