const express = require('express');
const router = express.Router();
const org = require('../controllers/organizerController');
const authenticate = require('../middlewares/authenticate');
const requireAdmin = require('../middlewares/requireAdmin');
const upload = require('../middlewares/upload');

router.get('/',       authenticate, requireAdmin, org.getAll);
router.get('/:id',    authenticate, requireAdmin, org.getOne);
router.post('/',      authenticate, requireAdmin, upload.single('logo'), org.create);
router.put('/:id',    authenticate, requireAdmin, upload.single('logo'), org.update);
router.delete('/:id', authenticate, requireAdmin, org.remove);

module.exports = router;
