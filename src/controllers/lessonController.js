const lessonService = require('../services/lessonService');
const { lessonSchema } = require('../validators/lessonSchema');
const getLessons = async (req, res) => {
  try {
    const lessons = await lessonService.getAllLessons();
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const getLesson = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const lesson = await lessonService.getLessonById(id);
    if (!lesson) return res.status(404).json({ error: 'Dars topilmadi' });

    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const createLesson = async (req, res) => {
  try {
    const { title, description } = req.body;
    const protocol = req.protocol;
    const host = req.get('host');

    const files = req.files || {};
    let { video_url } = req.body;

    if (files.video_file && files.video_file.length > 0) {
      const video = files.video_file[0];
      video_url = `${protocol}://${host}/uploads/videos/${video.filename}`;
    }

    // endi video_url qiymati to‘g‘ri bo‘ladi
    lessonSchema.parse({ ...req.body, video_url });

    const materialFiles = files.materials || [];
    const names = JSON.parse(req.body.material_names || '[]');

    const materials = materialFiles.map((file, index) => ({
      name: names[index] || file.originalname,
      url: `${protocol}://${host}/uploads/lessons/${file.filename}` // ✅ to‘liq URL
    }));

    const lesson = await lessonService.createLesson(
      { title, description, video_url },
      materials
    );

    res.status(201).json(lesson);
  } catch (err) {
    const status = err.statusCode || 400;

    // Zod error bo‘lsa formatlab yuboramiz
    if (err.errors && Array.isArray(err.errors)) {
      return res.status(status).json({
        error: 'Validation failed',
        details: err.errors.map((e) => e.message)
      });
    }

    res.status(status).json({
      error: 'Lesson creation failed',
      details: err.message
    });
  }
};

const updateLesson = async (req, res) => {
  try {
    console.log(req.body);
    
    const id = parseInt(req.params.id);
    const { title, description } = req.body;
    const protocol = req.protocol;
    const host = req.get('host');

    const files = req.files || {};
    let { video_url } = req.body;

    if (files.video_file && files.video_file.length > 0) {
      const video = files.video_file[0];
      video_url = `${protocol}://${host}/uploads/videos/${video.filename}`;
    }

    lessonSchema.parse({ ...req.body, video_url });

    const materialFiles = files.materials || [];
    const names = JSON.parse(req.body.material_names || '[]');

    const materials = materialFiles.map((file, index) => ({
      name: names[index] || file.originalname,
      url: `${protocol}://${host}/uploads/lessons/${file.filename}` // ✅ to‘liq URL
    }));
    console.log(id, title, description, video_url, materials);
    
    const updated = await lessonService.updateLesson(
      id,
      {
        title,
        description,
        video_url
      },
      materials
    );
    res.json(updated);
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: 'Update failed', details: err.message });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await lessonService.deleteLesson(id);
    res.json({ message: 'Dars o‘chirildi' });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: 'Delete failed', details: err.message });
  }
};

module.exports = {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson
};
