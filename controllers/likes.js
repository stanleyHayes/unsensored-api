const Like = require('../models/like');

exports.toggleLike = async (req, res) => {
    try {
        const like = await Like.findOne(
            {
                $and: [
                    {author: req.user._id},
                    {
                        $or:
                            [
                                {comment: req.body.comment},
                                {reply: req.body.reply},
                                {article: req.body.article}
                            ]
                    }
                ]
            });
        const {comment, reply, article} = req.body;
        if (!like) {
            await Like.create({author: req.user._id, comment, reply, article});
        } else {
            await like.remove();
        }
        res.status(200).json({data: like});
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
            likes = await Like.find({article: req.params.article});
        } else if (req.params.comment) {
            likes = await Like.find({comment: req.params.comment});
        } else if (req.params.reply) {
            likes = await Like.find({reply: req.params.reply});
        }
        res.status(200).json({data: likes});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}