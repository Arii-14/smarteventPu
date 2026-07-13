const express = require('express');
const router = express.Router();
const sp = require('../controllers/speakerController');
const authenticate = require('../middlewares/authenticate');
const requireAdmin = require('../middlewares/requireAdmin');
const upload = require('../middlewares/upload');

router.get('/',       authenticate, requireAdmin, sp.getAll);
router.post('/',      authenticate, requireAdmin, upload.single('photo'), sp.create);
router.put('/:id',    authenticate, requireAdmin, upload.single('photo'), sp.update);
router.delete('/:id', authenticate, requireAdmin, sp.remove);

module.exports = router;
