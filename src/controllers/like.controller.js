const Like = require('../models/like');
const catchAsync = require('../utils/catch-async');

exports.toggleLike = catchAsync(async (req, res) => {
    const { type, article, comment, reply } = req.body;
    const filter = { type, author: req.user._id };

    if (type === 'ARTICLE') filter.article = article;
    if (type === 'COMMENT') filter.comment = comment;
    if (type === 'REPLY') filter.reply = reply;

    const existing = await Like.findOne(filter);

    if (existing) {
        await existing.deleteOne();
        return res.status(200).json({ success: true, data: existing, action: 'REMOVE' });
    }

    const like = await Like.create(filter);
    res.status(201).json({ success: true, data: like, action: 'ADD' });
});

exports.getLikesByCategory = catchAsync(async (req, res) => {
    const filter = {};

    if (req.params.article) filter.article = req.params.article;
    else if (req.params.comment) filter.comment = req.params.comment;
    else if (req.params.reply) filter.reply = req.params.reply;
    else if (req.params.user) filter.author = req.params.user;

    let query = Like.find(filter);

    if (req.params.user) {
        query = query
            .populate({ path: 'comment', populate: { path: 'likes replyCount likeCount author' } })
            .populate({ path: 'article', populate: { path: 'likes likeCount commentCount viewCount author' } })
            .populate({ path: 'reply', populate: { path: 'likes likeCount author' } })
            .populate('author');
    } else {
        query = query.populate({ path: 'author', select: 'name _id username avatar' });
    }

    const likes = await query;
    res.status(200).json({ success: true, data: likes });
});

exports.getLikesByLoggedInUser = catchAsync(async (req, res) => {
    const likes = await Like.find({ author: req.user._id });
    res.status(200).json({ success: true, data: likes });
});
