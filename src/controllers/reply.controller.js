const Reply = require('../models/reply');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catch-async');

const POPULATE_REPLY = [
    { path: 'author', select: '_id name username avatar' },
    { path: 'likeCount' },
    { path: 'likes' },
];

exports.createReply = catchAsync(async (req, res) => {
    const reply = await Reply.create({
        text: req.body.text,
        author: req.user._id,
        article: req.body.article,
        comment: req.body.comment,
    });

    await reply.populate(POPULATE_REPLY);
    res.status(201).json({ success: true, data: reply });
});

exports.getReply = catchAsync(async (req, res) => {
    const reply = await Reply.findById(req.params.id).populate(POPULATE_REPLY);
    if (!reply) throw new AppError('Reply not found', 404);

    res.status(200).json({ success: true, data: reply });
});

exports.getReplies = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.params.user) filter.author = req.params.user;
    if (req.params.comment) filter.comment = req.params.comment;

    const [replies, total] = await Promise.all([
        Reply.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).populate(POPULATE_REPLY),
        Reply.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: replies,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});

exports.updateReply = catchAsync(async (req, res) => {
    const reply = await Reply.findOne({ _id: req.params.id, author: req.user._id });
    if (!reply) throw new AppError('Reply not found', 404);

    reply.text = req.body.text;
    await reply.save();
    await reply.populate(POPULATE_REPLY);

    res.status(200).json({ success: true, data: reply });
});

exports.deleteReply = catchAsync(async (req, res) => {
    const reply = await Reply.findOne({ _id: req.params.id, author: req.user._id });
    if (!reply) throw new AppError('Reply not found', 404);

    await reply.deleteOne();
    res.status(200).json({ success: true, data: reply });
});
