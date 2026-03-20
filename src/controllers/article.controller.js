const Article = require('../models/article');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catch-async');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const POPULATE_ARTICLE = [
    { path: 'author', select: 'avatar name username' },
    { path: 'commentCount' },
    { path: 'likeCount' },
    { path: 'viewCount' },
    { path: 'likes' },
];

const POPULATE_ARTICLE_FULL = [
    ...POPULATE_ARTICLE,
    { path: 'comments' },
    { path: 'views' },
];

exports.createArticle = catchAsync(async (req, res) => {
    if (!req.file) throw new AppError('Banner image is required', 400);

    const { url, publicId } = await uploadToCloudinary(req.file.buffer, {
        folder: 'unsensored/articles',
        transformation: [{ width: 1200, height: 630, crop: 'fill', quality: 'auto' }],
    });

    const article = await Article.create({
        title: req.body.title,
        banner: url,
        bannerPublicId: publicId,
        summary: req.body.summary,
        text: req.body.text,
        tags: JSON.parse(req.body.tags),
        author: req.user._id,
        datePublished: req.body.datePublished,
        published: req.body.published,
    });

    await article.populate(POPULATE_ARTICLE_FULL);
    res.status(201).json({ success: true, data: article });
});

exports.getArticle = catchAsync(async (req, res) => {
    const article = await Article.findById(req.params.id).populate(POPULATE_ARTICLE_FULL);
    if (!article) throw new AppError('Article not found', 404);
    res.status(200).json({ success: true, data: article });
});

exports.getArticles = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;
    const sort = { updatedAt: -1 };
    const filter = {};

    if (req.query.sortBy) {
        const [field, order] = req.query.sortBy.split(':');
        sort[field] = order === 'asc' ? 1 : -1;
    }

    if (req.query.published !== undefined) filter.published = req.query.published;
    if (req.query.tags) filter.tags = { $in: req.query.tags.split(',') };
    if (req.params.user) filter.author = req.params.user;
    if (req.query.search) {
        const q = req.query.search.trim();
        filter.$or = [
            { title: { $regex: q, $options: 'i' } },
            { summary: { $regex: q, $options: 'i' } },
            { tags: { $regex: q, $options: 'i' } },
        ];
    }

    const [articles, total] = await Promise.all([
        Article.find(filter).skip(skip).limit(limit).sort(sort).populate(POPULATE_ARTICLE),
        Article.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: articles,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});

exports.getAuthoredArticles = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;
    const sort = { updatedAt: -1 };
    const filter = { author: req.user._id };

    if (req.query.sortBy) {
        const [field, order] = req.query.sortBy.split(':');
        sort[field] = order === 'asc' ? 1 : -1;
    }

    if (req.query.published !== undefined) filter.published = req.query.published;
    if (req.query.tags) filter.tags = { $in: req.query.tags.split(',') };

    const [articles, total] = await Promise.all([
        Article.find(filter).skip(skip).limit(limit).sort(sort).populate(POPULATE_ARTICLE_FULL),
        Article.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: articles,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});

exports.updateArticle = catchAsync(async (req, res) => {
    const article = await Article.findOne({ _id: req.params.id, author: req.user._id });
    if (!article) throw new AppError('Article not found', 404);

    const allowed = ['text', 'summary', 'title', 'datePublished', 'published', 'tags'];
    for (const key of Object.keys(req.body)) {
        if (!allowed.includes(key)) throw new AppError(`Cannot update field: ${key}`, 400);
        article[key] = key === 'tags' ? req.body.tags.split(',') : req.body[key];
    }

    if (req.file) {
        // Delete old banner from cloudinary
        if (article.bannerPublicId) {
            await deleteFromCloudinary(article.bannerPublicId);
        }

        const { url, publicId } = await uploadToCloudinary(req.file.buffer, {
            folder: 'unsensored/articles',
            transformation: [{ width: 1200, height: 630, crop: 'fill', quality: 'auto' }],
        });

        article.banner = url;
        article.bannerPublicId = publicId;
    }

    await article.save();
    await article.populate(POPULATE_ARTICLE_FULL);

    res.status(200).json({ success: true, data: article });
});

exports.deleteArticle = catchAsync(async (req, res) => {
    const article = await Article.findOne({ _id: req.params.id, author: req.user._id });
    if (!article) throw new AppError('Article not found', 404);

    // Delete banner from cloudinary
    if (article.bannerPublicId) {
        await deleteFromCloudinary(article.bannerPublicId);
    }

    await article.deleteOne();
    res.status(200).json({ success: true, data: article });
});
