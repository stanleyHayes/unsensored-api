const mongoose = require('mongoose');
const Article = require('../models/article');
const User = require('../models/user');
const Follow = require('../models/follow');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catch-async');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { emitEvent } = require('../socket');

const POPULATE_ARTICLE = [
    { path: 'author', select: 'avatar name username' },
    { path: 'commentCount' },
    { path: 'likeCount' },
    { path: 'viewCount' },
    { path: 'bookmarkCount' },
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

    emitEvent(null, 'article:created', article);

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

exports.getTrendingArticles = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const now = new Date();

    const pipeline = [
        // Only published articles
        { $match: { published: true } },

        // Lookup like count
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'article',
                as: '_likes',
            },
        },

        // Lookup comment count
        {
            $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'article',
                as: '_comments',
            },
        },

        // Lookup view count
        {
            $lookup: {
                from: 'views',
                localField: '_id',
                foreignField: 'article',
                as: '_views',
            },
        },

        // Lookup bookmark count
        {
            $lookup: {
                from: 'bookmarks',
                localField: '_id',
                foreignField: 'article',
                as: '_bookmarks',
            },
        },

        // Calculate trending score with time decay
        {
            $addFields: {
                likeCount: { $size: '$_likes' },
                commentCount: { $size: '$_comments' },
                viewCount: { $size: '$_views' },
                bookmarkCount: { $size: '$_bookmarks' },
                _ageInDays: {
                    $divide: [
                        { $subtract: [now, { $ifNull: ['$datePublished', '$createdAt'] }] },
                        1000 * 60 * 60 * 24, // ms per day
                    ],
                },
            },
        },
        {
            $addFields: {
                // Weighted engagement score
                _engagementScore: {
                    $add: [
                        { $multiply: ['$likeCount', 3] },
                        { $multiply: ['$commentCount', 5] },
                        { $multiply: ['$viewCount', 1] },
                        { $multiply: ['$bookmarkCount', 4] },
                    ],
                },
                // Recency bonus: 1 / (1 + ageInDays) — newer articles get a multiplier closer to 1
                _recencyMultiplier: {
                    $divide: [1, { $add: [1, '$_ageInDays'] }],
                },
            },
        },
        {
            $addFields: {
                trendingScore: {
                    $multiply: ['$_engagementScore', '$_recencyMultiplier'],
                },
            },
        },

        // Sort by trending score descending
        { $sort: { trendingScore: -1 } },

        // Facet for pagination + total count in a single query
        {
            $facet: {
                articles: [
                    { $skip: skip },
                    { $limit: limit },
                    // Clean up temporary fields
                    {
                        $project: {
                            _likes: 0,
                            _comments: 0,
                            _views: 0,
                            _bookmarks: 0,
                            _ageInDays: 0,
                            _engagementScore: 0,
                            _recencyMultiplier: 0,
                        },
                    },
                ],
                totalCount: [{ $count: 'count' }],
            },
        },
    ];

    const [result] = await Article.aggregate(pipeline);

    const articles = result.articles;
    const total = result.totalCount[0]?.count || 0;

    // Populate author on the aggregation results
    await Article.populate(articles, { path: 'author', select: 'avatar name username' });

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

    emitEvent(`article:${article._id}`, 'article:updated', article);

    res.status(200).json({ success: true, data: article });
});

exports.getTags = catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;

    const tags = await Article.aggregate([
        { $match: { published: true } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { _id: 0, tag: '$_id', count: 1 } },
    ]);

    res.status(200).json({ success: true, data: tags });
});

exports.deleteArticle = catchAsync(async (req, res) => {
    const article = await Article.findOne({ _id: req.params.id, author: req.user._id });
    if (!article) throw new AppError('Article not found', 404);

    // Delete banner from cloudinary
    if (article.bannerPublicId) {
        await deleteFromCloudinary(article.bannerPublicId);
    }

    await article.deleteOne();

    emitEvent(null, 'article:deleted', { _id: article._id });

    res.status(200).json({ success: true, data: article });
});

exports.getFollowingFeed = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const follows = await Follow.find({ follower: req.user._id }).select('following').lean();
    const followingIds = follows.map((f) => f.following);

    if (!followingIds.length) {
        return res.status(200).json({
            success: true,
            data: [],
            message: 'Follow some authors to see their articles here',
            pagination: { page, limit, total: 0, totalPages: 0 },
        });
    }

    const filter = { author: { $in: followingIds }, published: true };

    const [articles, total] = await Promise.all([
        Article.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).populate(POPULATE_ARTICLE),
        Article.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: articles,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});

exports.getForYouFeed = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const now = new Date();

    // Get user's tag affinities
    const user = await User.findById(req.user._id).select('tagAffinities').lean();
    const affinities = (user?.tagAffinities || []).sort((a, b) => b.score - a.score);
    const affinityTags = affinities.map((a) => a.tag);

    // Build a map of tag -> score for the $switch in aggregation
    const tagScoreEntries = affinities.map((a) => ({
        case: { $eq: ['$$this', a.tag] },
        then: a.score * 5,
    }));

    // Get followed user IDs
    const follows = await Follow.find({ follower: req.user._id }).select('following').lean();
    const followingIds = follows.map((f) => f.following);

    const pipeline = [
        // Only published articles, exclude user's own
        { $match: { published: true, author: { $ne: req.user._id } } },

        // Lookup engagement counts
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'article',
                as: '_likes',
            },
        },
        {
            $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'article',
                as: '_comments',
            },
        },
        {
            $lookup: {
                from: 'views',
                localField: '_id',
                foreignField: 'article',
                as: '_views',
            },
        },
        {
            $lookup: {
                from: 'bookmarks',
                localField: '_id',
                foreignField: 'article',
                as: '_bookmarks',
            },
        },

        // Calculate scores
        {
            $addFields: {
                likeCount: { $size: '$_likes' },
                commentCount: { $size: '$_comments' },
                viewCount: { $size: '$_views' },
                bookmarkCount: { $size: '$_bookmarks' },
                _ageInDays: {
                    $divide: [
                        { $subtract: [now, { $ifNull: ['$datePublished', '$createdAt'] }] },
                        1000 * 60 * 60 * 24,
                    ],
                },
            },
        },
        {
            $addFields: {
                // Tag match score: sum of affinity scores for matching tags
                _tagMatchScore: affinityTags.length > 0
                    ? {
                        $reduce: {
                            input: { $ifNull: ['$tags', []] },
                            initialValue: 0,
                            in: {
                                $add: [
                                    '$$value',
                                    { $switch: { branches: tagScoreEntries, default: 0 } },
                                ],
                            },
                        },
                    }
                    : 0,

                // Follow score: +10 if author is followed
                _followScore: followingIds.length > 0
                    ? { $cond: [{ $in: ['$author', followingIds] }, 10, 0] }
                    : 0,

                // Engagement score
                _engagementScore: {
                    $add: [
                        { $multiply: ['$likeCount', 3] },
                        { $multiply: ['$commentCount', 5] },
                        { $multiply: ['$viewCount', 1] },
                        { $multiply: ['$bookmarkCount', 4] },
                    ],
                },

                // Recency bonus
                _recencyMultiplier: {
                    $divide: [1, { $add: [1, '$_ageInDays'] }],
                },
            },
        },
        {
            $addFields: {
                totalScore: {
                    $multiply: [
                        { $add: ['$_tagMatchScore', '$_followScore', '$_engagementScore'] },
                        '$_recencyMultiplier',
                    ],
                },
            },
        },

        // Sort by total score descending
        { $sort: { totalScore: -1 } },

        // Facet for pagination + total count
        {
            $facet: {
                articles: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            _likes: 0,
                            _comments: 0,
                            _views: 0,
                            _bookmarks: 0,
                            _ageInDays: 0,
                            _tagMatchScore: 0,
                            _followScore: 0,
                            _engagementScore: 0,
                            _recencyMultiplier: 0,
                        },
                    },
                ],
                totalCount: [{ $count: 'count' }],
            },
        },
    ];

    const [result] = await Article.aggregate(pipeline);

    const articles = result.articles;
    const total = result.totalCount[0]?.count || 0;

    // Populate author on aggregation results
    await Article.populate(articles, { path: 'author', select: 'avatar name username' });

    res.status(200).json({
        success: true,
        data: articles,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});
