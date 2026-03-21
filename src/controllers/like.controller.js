const Like = require('../models/like');
const Article = require('../models/article');
const Comment = require('../models/comment');
const Reply = require('../models/reply');
const catchAsync = require('../utils/catch-async');
const { emitEvent } = require('../socket');
const createNotification = require('../utils/create-notification');

const getArticleRoom = async (type, { article, comment, reply }) => {
    if (type === 'ARTICLE') return `article:${article}`;
    if (type === 'COMMENT') {
        const doc = await Comment.findById(comment).select('article').lean();
        return doc ? `article:${doc.article}` : null;
    }
    if (type === 'REPLY') {
        const doc = await Reply.findById(reply).select('article').lean();
        return doc ? `article:${doc.article}` : null;
    }
    return null;
};

exports.toggleLike = catchAsync(async (req, res) => {
    const { type, article, comment, reply } = req.body;

    const filter = { type, author: req.user._id };

    if (type === 'ARTICLE') filter.article = article;
    if (type === 'COMMENT') filter.comment = comment;
    if (type === 'REPLY') filter.reply = reply;

    // Atomic: try to delete first; if nothing deleted, create
    const deleted = await Like.findOneAndDelete(filter);

    if (deleted) {
        const room = await getArticleRoom(type, req.body);
        emitEvent(room, 'like:toggled', { like: deleted, action: 'REMOVE', type });
        return res.status(200).json({ success: true, data: deleted, action: 'REMOVE' });
    }
    console.log('like was not found hence creating new one')
    try {
        const like = await Like.create(filter);
        const room = await getArticleRoom(type, req.body);
        emitEvent(room, 'like:toggled', { like, action: 'ADD', type });

        // Notify the content owner
        if (type === 'ARTICLE') {
            const doc = await Article.findById(article).select('author').lean();
            if (doc) createNotification({ recipient: doc.author, sender: req.user._id, type: 'LIKE_ARTICLE', article });
        } else if (type === 'COMMENT') {
            const doc = await Comment.findById(comment).select('author article').lean();
            if (doc) createNotification({ recipient: doc.author, sender: req.user._id, type: 'LIKE_COMMENT', article: doc.article, comment });
        } else if (type === 'REPLY') {
            const doc = await Reply.findById(reply).select('author article comment').lean();
            if (doc) createNotification({ recipient: doc.author, sender: req.user._id, type: 'LIKE_REPLY', article: doc.article, comment: doc.comment, reply });
        }

        return res.status(201).json({ success: true, data: like, action: 'ADD' });
    } catch (err) {
        // Race condition: another request created it between our delete check and create
        if (err.code === 11000) {
            const existing = await Like.findOneAndDelete(filter);
            const room = await getArticleRoom(type, req.body);
            emitEvent(room, 'like:toggled', { like: existing, action: 'REMOVE', type });
            return res.status(200).json({ success: true, data: existing, action: 'REMOVE' });
        }
        throw err;
    }
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

exports.getMyLikedArticleIds = catchAsync(async (req, res) => {
    const likes = await Like.find({ author: req.user._id, type: 'ARTICLE' }).select('article');
    const articleIds = likes.map((l) => l.article.toString());
    res.status(200).json({ success: true, data: articleIds });
});
