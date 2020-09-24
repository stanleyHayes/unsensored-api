const express = require("express");
const likesRouter = require('../routes/likes');

const {createComment, deleteComment, getComment, getComments, updateComment} = require("../controllers/comments");
const {auth} = require("../middleware/auth");
const router = express.Router({mergeParams: true});

router.use('/likes', likesRouter);

router.post('/', auth, createComment);
router.get('/', auth, getComments);
router.delete('/:id', auth, deleteComment);
router.patch('/:id', auth, updateComment);
router.get('/:id', getComment);

module.exports = router;