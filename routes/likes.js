const express = require('express');
const {auth} = require('../middleware/auth');
const {toggleLike, getLikesByCategory} = require('../controllers/likes');

//api/v1/articles/:article/likes
//api/v1/comments/:comment/likes
//api/v1/replies/:reply/likes

const router = express.Router({mergeParams: true});

router.post('/', auth, toggleLike);
router.get('/', auth, getLikesByCategory);

module.exports = router;