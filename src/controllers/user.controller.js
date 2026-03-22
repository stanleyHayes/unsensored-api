const User = require('../models/user');
const Article = require('../models/article');
const Follow = require('../models/follow');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catch-async');

const POPULATE_USER = [
    'views', 'likes', 'comments', 'replies', 'articles',
    'articleCount', 'commentCount', 'replyCount', 'viewCount', 'likeCount',
    'followerCount', 'followingCount',
];

exports.getUsers = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    const filter = {};

    // Search by name, username, or bio
    if (req.query.search) {
        const q = req.query.search.trim();
        filter.$or = [
            { name: { $regex: q, $options: 'i' } },
            { username: { $regex: q, $options: 'i' } },
            { profile: { $regex: q, $options: 'i' } },
        ];
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (req.query.sortBy === 'name') sort = { name: 1 };
    if (req.query.sortBy === 'oldest') sort = { createdAt: 1 };

    const [users, total] = await Promise.all([
        User.find(filter).skip(skip).limit(limit).sort(sort).populate(POPULATE_USER),
        User.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});

exports.getUser = catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id).populate(POPULATE_USER);
    if (!user) throw new AppError('User not found', 404);

    res.status(200).json({ success: true, data: user });
});

exports.deleteUser = catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);

    await user.deleteOne();
    res.status(200).json({ success: true, data: user });
});

exports.getSuggestedUsers = catchAsync(async (req, res) => {
    // Get current user's followed IDs
    const follows = await Follow.find({ follower: req.user._id }).select('following').lean();
    const followingIds = follows.map((f) => f.following);

    // Get current user's top 10 tag affinities
    const currentUser = await User.findById(req.user._id).select('tagAffinities').lean();
    const topTags = (currentUser?.tagAffinities || [])
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((a) => a.tag);

    // Find authors of articles matching the user's top tags
    const excludeIds = [req.user._id, ...followingIds];
    let tagAuthorIds = [];
    if (topTags.length > 0) {
        const tagArticles = await Article.find({
            tags: { $in: topTags },
            published: true,
            author: { $nin: excludeIds },
        }).select('author tags').lean();

        // Count tag overlap per author
        const authorTagCount = new Map();
        for (const article of tagArticles) {
            const id = article.author.toString();
            const overlap = article.tags.filter((t) => topTags.includes(t)).length;
            authorTagCount.set(id, (authorTagCount.get(id) || 0) + overlap);
        }
        tagAuthorIds = [...authorTagCount.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([id]) => id);
    }

    // Find suggested users: either authored matching-tag articles or have high follower counts
    const pipeline = [
        {
            $match: {
                _id: { $nin: excludeIds },
                isActive: true,
            },
        },
        // Lookup follower count
        {
            $lookup: {
                from: 'follows',
                localField: '_id',
                foreignField: 'following',
                as: '_followers',
            },
        },
        {
            $addFields: {
                followerCount: { $size: '$_followers' },
                _tagRelevance: tagAuthorIds.length > 0
                    ? { $cond: [{ $in: [{ $toString: '$_id' }, tagAuthorIds] }, 10, 0] }
                    : 0,
            },
        },
        {
            $addFields: {
                _relevanceScore: { $add: ['$_tagRelevance', '$followerCount'] },
            },
        },
        { $sort: { _relevanceScore: -1 } },
        { $limit: 10 },
        {
            $project: {
                _followers: 0,
                _tagRelevance: 0,
                _relevanceScore: 0,
                password: 0,
                tokens: 0,
            },
        },
    ];

    const users = await User.aggregate(pipeline);

    // Populate virtuals aren't available on aggregation, but we already have followerCount
    // Add avatar, name, username which are already in the projection

    res.status(200).json({ success: true, data: users });
});
