const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');
const getAllLessons = async () => {
  return await prisma.lesson.findMany({
    include: {
      materials: true
    }
  });
};

const getLessonById = async (id) => {
  return await prisma.lesson.findUnique({
    where: { id },
    include: { materials: true }
  });
};

const createLesson = async (data, materialData = []) => {
  // Avval title bo‘yicha lesson borligini tekshiramiz
  const existing = await prisma.lesson.findFirst({
    where: {
      title: data.title
    }
  });

  if (existing) {
    const error = new Error('Bu nomli dars allaqachon mavjud');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.lesson.create({
    data: {
      ...data,
      materials: {
        create: materialData
      }
    },
    include: { materials: true }
  });
};

const updateLesson = async (id, data, newMaterials = []) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { materials: true }
  });

  if (!lesson) {
    const err = new Error('Dars topilmadi');
    err.statusCode = 404;
    throw err;
  }

  // 1. Eski material fayllarni o‘chirish
  for (const material of lesson.materials) {
    try {
      const url = new URL(material.url);
      const pathFromUrl = url.pathname.replace('/uploads/', '');
      const filepath = path.join(__dirname, '../../uploads', pathFromUrl);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    } catch {
      /* fayl yo‘q bo‘lishi mumkin — o‘tib ketamiz */
    }
  }

  // 2. Eski video faylni ham o‘chirish (agar uploads ichida bo‘lsa)
  if (lesson.video_url?.includes('/uploads/videos/')) {
    try {
      const url = new URL(lesson.video_url);
      const pathFromUrl = url.pathname.replace('/uploads/', '');
      const videoPath = path.join(__dirname, '../../uploads', pathFromUrl);
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    } catch {
      /* video fayl bo‘lmasligi mumkin — jim o‘tamiz */
    }
  }

  // 3. Bazadagi materiallar yozuvini tozalash
  await prisma.material.deleteMany({ where: { lessonId: id } });

  // 4. Yangilash
  return await prisma.lesson.update({
    where: { id },
    data: {
      ...data,
      materials: {
        create: newMaterials
      }
    },
    include: { materials: true }
  });
};

const deleteLesson = async (id) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { materials: true }
  });

  if (!lesson) {
    const err = new Error('Dars topilmadi');
    err.statusCode = 404;
    throw err;
  }

  // 1. Har bir material faylini o‘chiramiz
  for (const material of lesson.materials) {
    try {
      const url = new URL(material.url);
      const filePathFromUrl = url.pathname.replace('/uploads/', '');
      const filepath = path.join(__dirname, '../../uploads', filePathFromUrl);

      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log('🗑 Material fayli o‘chirildi:', filepath);
      }
    } catch {
      console.warn('⚠️ Material fayl yo‘li xato:', material.url);
    }
  }

  // 2. Video faylni ham o‘chiramiz agar uploads ichida bo‘lsa
  try {
    if (lesson.video_url && lesson.video_url.includes('/uploads/videos/')) {
      const url = new URL(lesson.video_url);
      const videoPath = url.pathname.replace('/uploads/', '');
      const videoFile = path.join(__dirname, '../../uploads', videoPath);

      if (fs.existsSync(videoFile)) {
        fs.unlinkSync(videoFile);
        console.log('🎬 Video fayl o‘chirildi:', videoFile);
      }
    }
  } catch {
    console.warn('⚠️ Video fayl yo‘li xato:', lesson.video_url);
  }

  // 3. Bazadan o‘chiramiz
  return await prisma.lesson.delete({ where: { id } });
};

module.exports = {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson
};
