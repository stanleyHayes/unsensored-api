const Follow = require('../models/follow');
const catchAsync = require('../utils/catch-async');
const { emitEvent } = require('../socket');
const createNotification = require('../utils/create-notification');

exports.toggleFollow = catchAsync(async (req, res) => {
    const { following } = req.body;
    const filter = { follower: req.user._id, following };

    const deleted = await Follow.findOneAndDelete(filter);

    if (deleted) {
        emitEvent(`user:${following}`, 'follow:toggled', { follow: deleted, action: 'REMOVE' });
        return res.status(200).json({ success: true, data: deleted, action: 'REMOVE' });
    }

    try {
        const follow = await Follow.create(filter);
        emitEvent(`user:${following}`, 'follow:toggled', { follow, action: 'ADD' });
        createNotification({ recipient: following, sender: req.user._id, type: 'FOLLOW_USER' });
        return res.status(201).json({ success: true, data: follow, action: 'ADD' });
    } catch (err) {
        if (err.code === 11000) {
            const existing = await Follow.findOneAndDelete(filter);
            emitEvent(`user:${following}`, 'follow:toggled', { follow: existing, action: 'REMOVE' });
            return res.status(200).json({ success: true, data: existing, action: 'REMOVE' });
        }
        throw err;
    }
});

exports.getFollowers = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const filter = { following: req.params.userId };

    const [followers, total] = await Promise.all([
        Follow.find(filter)
            .skip(skip).limit(limit)
            .sort({ createdAt: -1 })
            .populate({ path: 'follower', select: 'avatar name username' }),
        Follow.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: followers,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});

exports.getFollowing = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const filter = { follower: req.params.userId };

    const [following, total] = await Promise.all([
        Follow.find(filter)
            .skip(skip).limit(limit)
            .sort({ createdAt: -1 })
            .populate({ path: 'following', select: 'avatar name username' }),
        Follow.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: following,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});

exports.getMyFollowingIds = catchAsync(async (req, res) => {
    const follows = await Follow.find({ follower: req.user._id }).select('following');
    const userIds = follows.map((f) => f.following.toString());
    res.status(200).json({ success: true, data: userIds });
});

exports.getFollowCounts = catchAsync(async (req, res) => {
    const { userId } = req.params;

    const [followerCount, followingCount] = await Promise.all([
        Follow.countDocuments({ following: userId }),
        Follow.countDocuments({ follower: userId }),
    ]);

    res.status(200).json({ success: true, data: { followerCount, followingCount } });
});
