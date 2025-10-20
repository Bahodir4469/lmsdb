const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ error: 'Faqat adminlar uchun ruxsat berilgan' });
  }
  next();
};

module.exports = adminOnly;
