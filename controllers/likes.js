const Like = require('../models/like');

exports.toggleLike = async (req, res) => {
    try {
        let like = null;
        let action;
        const {comment, reply, article, type} = req.body;
        switch (type) {
            case 'ARTICLE':
                like = await Like.findOne({type: 'ARTICLE', author: req.user._id, article});
                if (!like) {
                    like = new Like({type: 'ARTICLE', author: req.user._id, article});
                    await like.save();
                    action = 'ADD';
                } else {
                    like.remove();
                    action = 'REMOVE';
                }
                break;
            case 'COMMENT':
                like = await Like.findOne({type: 'COMMENT', author: req.user._id, comment});
                if (!like) {
                    like = new Like({type: 'COMMENT', author: req.user._id, comment});
                    await like.save();
                    action = 'ADD';
                } else {
                    like.remove();
                    action = 'REMOVE';
                }
                break;
            case 'REPLY':
                like = await Like.findOne({type: 'REPLY', author: req.user._id, reply});
                if (!like) {
                    like = new Like({type: 'REPLY', author: req.user._id, reply});
                    await like.save();
                    action = 'ADD';
                } else {
                    like.remove();
                    action = 'REMOVE';
                }
                break;
        }
        res.status(200).json({data: like, action});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

//get likes by author, comment, reply, article
//api/v1/articles/:article/likes
//api/v1/comments/:comment/likes
//api/v1/replies/:reply/likes

exports.getLikesByCategory = async (req, res) => {
    try {
        let likes = [];
        if (req.params.article) {
            likes = await Like.find({article: req.params.article})
                .populate({path: 'author', select: 'name _id username avatar'});
        } else if (req.params.comment) {
            likes = await Like.find({comment: req.params.comment})
                .populate({path: 'author', select: '_id name username'});
        } else if (req.params.reply) {
            likes = await Like.find({reply: req.params.reply})
                .populate({path: 'author', select: '_id name username'});
        } else if (req.params.user) {
            likes = await Like.find({author: req.params.user}).populate('comment').populate('article').populate('like');
        }
        res.status(200).json({data: likes});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

exports.getLikesByLoggedInUser = async (req, res) => {
    try {
        const likes = await Like.find({author: req.user._id});
        res.status(200).json({data: likes});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}