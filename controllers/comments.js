const Comment = require('../models/comment');

exports.createComment = async (req, res) => {
    try {
        let comment = new Comment({
            text: req.body.text,
            author: req.user._id,
            article: req.body.article
        });

        await comment.save();
        comment = await Comment.findById(comment._id)
            .populate({
                path: 'author',
                select: 'name username avatar'
            });
        return res.status(201).json({data: comment});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

exports.getComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
            .populate({
                path: 'author',
                select: 'name username avatar'
            });
        if (!comment) {
            return res.status(400).json({error: 'comment not found'});
        }
        return res.status(200).json({data: comment});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

exports.getComments = async (req, res) => {
    try {
        const comments = await Comment.find({article: req.body.article})
            .populate({
                path: 'author',
                select: 'name username avatar'
            });
        return res.status(200).json({data: comments});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

exports.updateComment = async (req, res) => {
    try {
        let comment = await Comment.findOne({author: req.user._id, _id: req.params.id})
            .populate({
                path: 'author',
                select: 'name username avatar'
            });
        if (!comment) {
            return res.status(404).json({error: 'comment not found'});
        }
        const allowedUpdates = ['text'];
        const updates = Object.keys(req.body);
        const isAllowed = updates.every(update => allowedUpdates.includes(update));
        if (!isAllowed) {
            return res.status(400).json({error: 'action not allowed'});
        }
        for (let key of updates) {
            comment[key] = req.body[key];
        }
        await comment.save();
        return res.status(200).json({data: comment});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

exports.deleteComment = async (req, res) => {
    try {
        let comment = await Comment.findOne({author: req.user._id, _id: req.params.id});
        if (!comment) {
            return res.status(404).json({error: 'action not allowed'});
        }
        await comment.remove();
        return res.status(200).json({data: comment});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}