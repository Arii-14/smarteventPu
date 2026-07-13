const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');
const requireSuperAdmin = require('../middlewares/requireSuperAdmin');

router.post('/register',          auth.register);
router.post('/verify-otp',        auth.verifyOTPHandler);
router.post('/resend-otp',        auth.resendOTP);
router.post('/login',             auth.login);
router.post('/forgot-password',   auth.forgotPassword);
router.post('/reset-password',    auth.resetPassword);

// Super Admin password change (protected)
router.post('/change-super-admin-password', authenticate, requireSuperAdmin, auth.changeSuperAdminPassword);

module.exports = router;
