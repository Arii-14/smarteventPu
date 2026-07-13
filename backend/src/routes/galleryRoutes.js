const express = require('express');
const router = express.Router();
const gal = require('../controllers/galleryController');
const authenticate = require('../middlewares/authenticate');
const requireAdmin = require('../middlewares/requireAdmin');
const upload = require('../middlewares/upload');

router.post('/:eventId',  authenticate, requireAdmin, upload.single('image'), gal.uploadImage);
router.delete('/:id',     authenticate, requireAdmin, gal.deleteImage);

module.exports = router;
