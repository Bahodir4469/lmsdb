const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Ruxsat yo‘q (role)' });
    }
    next();
  };
};

module.exports = hasRole;
