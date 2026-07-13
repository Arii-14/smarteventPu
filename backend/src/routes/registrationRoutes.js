const express = require('express');
const router = express.Router();
const reg = require('../controllers/registrationController');
const authenticate = require('../middlewares/authenticate');
const requireAdmin = require('../middlewares/requireAdmin');

router.get('/me',      authenticate, reg.getMyHistory);
router.get('/scan/:token', reg.scanGuestTicket);
router.post('/guest/:eventId', reg.registerGuest);
router.post('/:eventId',    authenticate, reg.registerEvent);
router.delete('/:eventId',  authenticate, reg.cancelRegistration);
router.get('/:id/ticket',   authenticate, reg.getTicket);

// Admin: batalkan pendaftaran user manapun berdasarkan registration ID
router.delete('/admin/:registrationId', authenticate, requireAdmin, reg.adminCancelRegistration);

module.exports = router;

