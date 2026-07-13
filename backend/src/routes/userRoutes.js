const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');
const requireSuperAdmin = require('../middlewares/requireSuperAdmin');
const requireAdmin = require('../middlewares/requireAdmin');
const upload = require('../middlewares/upload');

// Own profile
router.get('/me',         authenticate, user.getMe);
router.put('/me',         authenticate, user.updateMe);
router.post('/me/photo',  authenticate, upload.single('photo'), user.uploadPhoto);
router.delete('/me',      authenticate, user.deleteMe);  // Self-delete account

// Super Admin: list admin-only users (must be before /:id to avoid collision)
router.get('/admins',     authenticate, requireSuperAdmin, user.getAdminUsers);

// Super Admin: manage all users
router.get('/',           authenticate, requireSuperAdmin, user.getAllUsers);
router.put('/:id/role',   authenticate, requireSuperAdmin, user.updateUserRole);
router.delete('/:id',     authenticate, requireSuperAdmin, user.deleteUser);

// Admin & Super Admin: reject a user account (sends email + deletes)
router.post('/:id/reject', authenticate, requireAdmin, user.rejectUser);

module.exports = router;

