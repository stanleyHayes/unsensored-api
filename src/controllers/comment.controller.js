const Comment = require('../models/comment');
const Article = require('../models/article');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catch-async');
const { emitEvent } = require('../socket');
const createNotification = require('../utils/create-notification');

const POPULATE_COMMENT = [
    { path: 'author', select: 'name username avatar' },
    { path: 'replyCount' },
    { path: 'likeCount' },
    { path: 'likes' },
];

exports.createComment = catchAsync(async (req, res) => {
    const comment = await Comment.create({
        text: req.body.text,
        author: req.user._id,
        article: req.body.article,
    });

    await comment.populate(POPULATE_COMMENT);

    emitEvent(`article:${comment.article}`, 'comment:created', comment);

    const articleDoc = await Article.findById(comment.article).select('author').lean();
    if (articleDoc) createNotification({ recipient: articleDoc.author, sender: req.user._id, type: 'COMMENT_ARTICLE', article: comment.article, comment: comment._id });

    res.status(201).json({ success: true, data: comment });
});

exports.getComment = catchAsync(async (req, res) => {
    const comment = await Comment.findById(req.params.id)
        .populate([...POPULATE_COMMENT, { path: 'replies' }]);

    if (!comment) throw new AppError('Comment not found', 404);

    res.status(200).json({ success: true, data: comment });
});

exports.getComments = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.params.user) filter.author = req.params.user;
    if (req.params.article) filter.article = req.params.article;

    const [comments, total] = await Promise.all([
        Comment.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).populate(POPULATE_COMMENT),
        Comment.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: comments,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});

exports.updateComment = catchAsync(async (req, res) => {
    const comment = await Comment.findOne({ _id: req.params.id, author: req.user._id });
    if (!comment) throw new AppError('Comment not found', 404);

    comment.text = req.body.text;
    await comment.save();
    await comment.populate(POPULATE_COMMENT);

    emitEvent(`article:${comment.article}`, 'comment:updated', comment);

    res.status(200).json({ success: true, data: comment });
});

exports.deleteComment = catchAsync(async (req, res) => {
    const comment = await Comment.findOne({ _id: req.params.id, author: req.user._id });
    if (!comment) throw new AppError('Comment not found', 404);

    const articleId = comment.article;
    await comment.deleteOne();

    emitEvent(`article:${articleId}`, 'comment:deleted', { _id: comment._id, article: articleId });

    res.status(200).json({ success: true, data: comment });
});
