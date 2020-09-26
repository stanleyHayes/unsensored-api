const express = require("express");
const likesRouter = require('../routes/likes');

const {auth} = require("../middleware/auth");
const {createReply, deleteReply, getReplies, getReply, updateReply} = require("../controllers/replies");
const router = express.Router({mergeParams: true});

router.use('/likes', likesRouter);

router.post('/', auth, createReply);
router.get('/', auth, getReplies);
router.get('/me', auth, getReplies);
router.delete('/:id', auth, deleteReply);
router.patch('/:id', auth, updateReply);
router.get('/:id', getReply);

module.exports = router;