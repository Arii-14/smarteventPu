const express = require('express');
const router = express.Router();
const cat = require('../controllers/categoryController');
const authenticate = require('../middlewares/authenticate');
const requireAdmin = require('../middlewares/requireAdmin');

router.get('/',     cat.getAll);
router.post('/',    authenticate, requireAdmin, cat.create);
router.put('/:id',  authenticate, requireAdmin, cat.update);
router.delete('/:id', authenticate, requireAdmin, cat.remove);

module.exports = router;
