const Like = require('../models/like');

exports.toggleLike = async (req, res) => {
    try {
        let like = await Like.findOne(
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

        const {comment, reply, article, type} = req.body;
        if (!like) {
            switch (type) {
                case 'ARTICLE':
                    like = new Like({type: 'ARTICLE', author: req.user._id, article});
                    await like.save();
                    break;
                case 'COMMENT':
                    like = new Like({type: 'COMMENT', author: req.user._id, comment});
                    await like.save();
                    break;
                case 'REPLY':
                    like = new Like({type: 'REPLY', author: req.user._id, reply});
                    await like.save();
                    break;
            }
        } else {
            await like.remove();
        }
        res.status(200).json({data: like});
    } catch (e) {
        console.log(e.message);
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
        }else if(req.params.user){
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