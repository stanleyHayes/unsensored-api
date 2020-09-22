const Reply = require('../models/reply');

exports.createReply = async (req, res) => {
    try {
        let reply = new Reply({
            text: req.body.text,
            author: req.user._id,
            article: req.body.article,
            comment: req.body.comment
        });

        await reply.save();
        reply = await Reply.findById(reply._id)
            .populate({
                path: 'author',
                select: 'name username avatar'
            });
        return res.status(201).json({data: reply});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

exports.getReply = async (req, res) => {
    try {
        const reply = await Reply.findById(req.params.id)
            .populate({
                path: 'author',
                select: 'name username avatar'
            });
        if (!reply) {
            return res.status(400).json({error: 'comment not found'});
        }
        return res.status(200).json({data: reply});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

exports.getReplies = async (req, res) => {
    try {
        const replies = await Reply.find({comment: req.body.comment, article: req.body.article})
            .populate({
                path: 'author',
                select: 'name username avatar'
            });
        return res.status(200).json({data: replies});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

exports.updateReply = async (req, res) => {
    try {
        let reply = await Reply.findOne({author: req.user._id, _id: req.params.id})
            .populate({
                path: 'author',
                select: 'name username avatar'
            });
        if (!reply) {
            return res.status(404).json({error: 'action not allowed'});
        }
        const allowedUpdates = ['text'];
        const updates = Object.keys(req.body);
        const isAllowed = updates.every(update => allowedUpdates.includes(update));
        if (!isAllowed) {
            return res.status(400).json({error: 'action not allowed'});
        }
        for (let key of updates) {
            reply[key] = req.body[key];
        }
        await reply.save();
        return res.status(200).json({data: reply});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

exports.deleteReply = async (req, res) => {
    try {
        let reply = await Reply.findOne({author: req.user._id, _id: req.params.id});
        if (!reply) {
            return res.status(404).json({error: 'action not allowed'});
        }
        await reply.remove();
        return res.status(200).json({data: reply});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}