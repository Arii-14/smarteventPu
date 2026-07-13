const express = require('express');
const router = express.Router();
const fav = require('../controllers/favoriteController');
const authenticate = require('../middlewares/authenticate');

router.get('/',           authenticate, fav.getFavorites);
router.post('/:eventId',  authenticate, fav.addFavorite);
router.delete('/:eventId',authenticate, fav.removeFavorite);

module.exports = router;
