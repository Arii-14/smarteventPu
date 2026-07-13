const express = require('express');
const router = express.Router();
const abt = require('../controllers/aboutController');
const authenticate = require('../middlewares/authenticate');
const requireSuperAdmin = require('../middlewares/requireSuperAdmin');
const upload = require('../middlewares/upload');

// Public can view developers
router.get('/developers', abt.getAll);

// Only Super Admin can manage
router.post('/developers',      authenticate, requireSuperAdmin, upload.single('photo'), abt.create);
router.put('/developers/:id',   authenticate, requireSuperAdmin, upload.single('photo'), abt.update);
router.delete('/developers/:id',authenticate, requireSuperAdmin, abt.remove);

module.exports = router;
