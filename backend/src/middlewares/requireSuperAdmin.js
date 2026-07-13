const requireSuperAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Tidak terautentikasi.' });
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya Super Admin yang diizinkan.' });
  }
  next();
};

module.exports = requireSuperAdmin;
