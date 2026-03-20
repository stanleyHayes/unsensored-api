const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catch-async');
const { JWT_SECRET } = require('../config/config');

const authenticate = catchAsync(async (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        throw new AppError('Authentication required', 401);
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

    if (!user) {
        throw new AppError('Authentication required', 401);
    }

    req.user = user;
    req.token = token;
    next();
});

const authorize = (...roles) => (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
        throw new AppError('Insufficient permissions', 403);
    }
    next();
};

module.exports = { authenticate, authorize };
