const Bookmark = require('../models/bookmark');
const catchAsync = require('../utils/catch-async');
const { emitEvent } = require('../socket');

exports.toggleBookmark = catchAsync(async (req, res) => {
    const { article } = req.body;
    const filter = { author: req.user._id, article };

    const deleted = await Bookmark.findOneAndDelete(filter);

    if (deleted) {
        emitEvent(`article:${article}`, 'bookmark:toggled', { bookmark: deleted, action: 'REMOVE' });
        return res.status(200).json({ success: true, data: deleted, action: 'REMOVE' });
    }

    try {
        const bookmark = await Bookmark.create(filter);
        emitEvent(`article:${article}`, 'bookmark:toggled', { bookmark, action: 'ADD' });
        return res.status(201).json({ success: true, data: bookmark, action: 'ADD' });
    } catch (err) {
        if (err.code === 11000) {
            const existing = await Bookmark.findOneAndDelete(filter);
            emitEvent(`article:${article}`, 'bookmark:toggled', { bookmark: existing, action: 'REMOVE' });
            return res.status(200).json({ success: true, data: existing, action: 'REMOVE' });
        }
        throw err;
    }
});

exports.getMyBookmarks = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const filter = { author: req.user._id };

    const [bookmarks, total] = await Promise.all([
        Bookmark.find(filter)
            .skip(skip).limit(limit)
            .sort({ createdAt: -1 })
            .populate({
                path: 'article',
                populate: [
                    { path: 'author', select: 'avatar name username' },
                    { path: 'commentCount' },
                    { path: 'likeCount' },
                    { path: 'viewCount' },
                    { path: 'likes' },
                ],
            }),
        Bookmark.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: bookmarks,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});

exports.getBookmarksByArticle = catchAsync(async (req, res) => {
    const bookmarks = await Bookmark.find({ article: req.params.articleId })
        .populate({ path: 'author', select: 'name username avatar' })
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookmarks });
});

exports.getMyBookmarkIds = catchAsync(async (req, res) => {
    const bookmarks = await Bookmark.find({ author: req.user._id }).select('article');
    const articleIds = bookmarks.map((b) => b.article.toString());
    res.status(200).json({ success: true, data: articleIds });
});
