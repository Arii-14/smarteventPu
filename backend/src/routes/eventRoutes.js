const express = require('express');
const router = express.Router();
const ev = require('../controllers/eventController');
const authenticate = require('../middlewares/authenticate');
const requireAdmin = require('../middlewares/requireAdmin');
const upload = require('../middlewares/upload');

// Optional authentication to detect role for filtering
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
  const token = authHeader.split(' ')[1];
  try {
    const jwt = require('jsonwebtoken');
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {}
  next();
};

// Super Admin only middleware
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Tidak terautentikasi.' });
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya Super Admin yang diizinkan.' });
  }
  next();
};

router.get('/',               optionalAuth, ev.getAll);
router.get('/:id',            optionalAuth, ev.getOne);

router.post('/',              authenticate, requireAdmin, upload.single('banner'), ev.create);
router.put('/:id',            authenticate, requireAdmin, upload.single('banner'), ev.update);
router.delete('/:id',         authenticate, requireAdmin, ev.remove);
router.get('/:id/participants', authenticate, requireAdmin, ev.getParticipants);

// Attendance & Event Control
router.put('/:id/start',                         authenticate, requireAdmin, ev.startEvent);
router.put('/:id/finish',                        authenticate, requireAdmin, ev.finishEvent);
router.put('/:id/clear',                         authenticate, requireAdmin, ev.clearEvent);
router.put('/:id/attendance/:registrationId',    authenticate, requireAdmin, ev.updateAttendance);
router.post('/:id/scan',                         authenticate, requireAdmin, ev.scanQRAttendance);

module.exports = router;
