const User = require('../models/user');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catch-async');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const POPULATE_USER = [
    { path: 'views', populate: { path: 'article', select: 'summary _id title' } },
    { path: 'comments', populate: { path: 'article', select: '_id title' } },
    { path: 'likes' },
];

exports.register = catchAsync(async (req, res) => {
    const user = await User.create(req.body);
    const token = await user.generateToken(req.useragent);
    await user.save();

    res.status(201).json({ success: true, data: user, token });
});

exports.login = catchAsync(async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        throw new AppError('Invalid credentials', 401);
    }

    const token = await user.generateToken(req.useragent);
    await user.save();

    res.status(200).json({ success: true, data: user, token });
});

exports.getMe = catchAsync(async (req, res) => {
    await req.user.populate(POPULATE_USER);
    res.status(200).json({ success: true, data: req.user, token: req.token });
});

exports.updateProfile = catchAsync(async (req, res) => {
    const updates = req.body;
    Object.assign(req.user, updates);

    if (req.file) {
        // Delete old avatar from cloudinary
        if (req.user.avatarPublicId) {
            await deleteFromCloudinary(req.user.avatarPublicId);
        }

        const { url, publicId } = await uploadToCloudinary(req.file.buffer, {
            folder: 'unsensored/avatars',
            transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }],
        });

        req.user.avatar = url;
        req.user.avatarPublicId = publicId;
    }

    await req.user.save();
    await req.user.populate(POPULATE_USER);

    res.status(200).json({ success: true, data: req.user });
});

exports.logout = catchAsync(async (req, res) => {
    req.user.tokens = req.user.tokens.filter((t) => t.token !== req.token);
    await req.user.save();
    res.status(200).json({ success: true, message: 'Logged out' });
});

exports.logoutAll = catchAsync(async (req, res) => {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).json({ success: true, message: 'Logged out from all devices' });
});
