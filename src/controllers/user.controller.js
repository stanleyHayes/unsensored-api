const User = require('../models/user');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catch-async');

const POPULATE_USER = [
    'views', 'likes', 'comments', 'replies', 'articles',
    'articleCount', 'commentCount', 'replyCount', 'viewCount', 'likeCount',
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
