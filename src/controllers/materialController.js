const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

const createMaterial = async (req, res) => {
  try {
    const { name, lessonId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Fayl jo‘natilmadi' });
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}/uploads/lessons/${req.file.filename}`;

    const material = await prisma.material.create({
      data: {
        name,
        url,
        lessonId: parseInt(lessonId)
      }
    });

    res.status(201).json(material);
  } catch (err) {
    res
      .status(400)
      .json({ error: 'Material creation failed', details: err.message });
  }
};

const updateMaterial = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name } = req.body;
    const file = req.file;

    const material = await prisma.material.findUnique({ where: { id } });
    if (!material) return res.status(404).json({ error: 'Material topilmadi' });

    let updatedData = {};

    // 1. Agar name berilgan bo‘lsa
    if (name) {
      updatedData.name = name;
    }

    // 2. Agar yangi fayl jo‘natilgan bo‘lsa
    if (file) {
      // Eski faylni o‘chirish
      try {
        const oldUrl = new URL(material.url);
        const filePathFromUrl = oldUrl.pathname.replace('/uploads/', '');
        const filepath = path.join(__dirname, '../../uploads', filePathFromUrl);
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      } catch (e) {
        console.warn('⚠️ Eski fayl o‘chirilmadi:', e.message);
      }

      // Yangi URL
      const protocol = req.protocol;
      const host = req.get('host');
      updatedData.url = `${protocol}://${host}/uploads/lessons/${file.filename}`;
    }

    const updated = await prisma.material.update({
      where: { id },
      data: updatedData
    });

    res.json(updated);
  } catch (err) {
    console.error('❌ Material update xato:', err);
    res.status(400).json({ error: 'Update failed', details: err.message });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const material = await prisma.material.findUnique({ where: { id } });

    if (!material) return res.status(404).json({ error: 'Topilmadi' });

    // Fayl manzilini URL dan ajratib olish
    const url = new URL(material.url);
    const filePathFromUrl = url.pathname.replace('/uploads/', '');
    const filepath = path.join(__dirname, '../../uploads', filePathFromUrl);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log('✅ Fayl o‘chirildi:', filepath);
    }

    await prisma.material.delete({ where: { id } });

    res.json({ message: 'Material va fayl o‘chirildi' });
  } catch (err) {
    console.error('❌ Xatolik:', err);
    res.status(400).json({ error: 'Delete failed', details: err.message });
  }
};

module.exports = { deleteMaterial, createMaterial, updateMaterial };
