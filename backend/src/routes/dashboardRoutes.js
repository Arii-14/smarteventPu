const express = require('express');
const router = express.Router();
const dash = require('../controllers/dashboardController');
const authenticate = require('../middlewares/authenticate');
const requireAdmin = require('../middlewares/requireAdmin');

router.get('/stats', dash.getStats);
router.get('/recent-registrations', authenticate, requireAdmin, dash.getRecentRegistrations);

module.exports = router;
