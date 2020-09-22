const express = require("express");

const {createReply, deleteReply, getReplies, getReply, updateReply} = require("../controllers/replies");
const {auth} = require("../middleware/auth");
const router = express.Router({mergeParams: true});

router.post('/', auth, createReply);
router.get('/', auth, getReplies);
router.delete('/:id', auth, deleteReply);
router.patch('/:id', auth, updateReply);
router.get('/:id', getReply);

module.exports = router;