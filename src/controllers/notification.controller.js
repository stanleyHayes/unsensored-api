const Notification = require('../models/notification');
const catchAsync = require('../utils/catch-async');

exports.getNotifications = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = { recipient: req.user._id };

    const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(filter)
            .skip(skip).limit(limit)
            .sort({ createdAt: -1 })
            .populate('sender', 'name username avatar')
            .populate('article', 'title')
            .populate('comment', 'text'),
        Notification.countDocuments(filter),
        Notification.countDocuments({ ...filter, read: false }),
    ]);

    res.status(200).json({
        success: true,
        data: notifications,
        unreadCount,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});

exports.markAsRead = catchAsync(async (req, res) => {
    await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user._id },
        { read: true },
    );
    res.status(200).json({ success: true });
});

exports.markAllAsRead = catchAsync(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, read: false },
        { read: true },
    );
    res.status(200).json({ success: true });
});
