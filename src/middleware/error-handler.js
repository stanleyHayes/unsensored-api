const { NODE_ENV } = require('../config/config');

const errorHandler = (err, req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue).join(', ');
        statusCode = 409;
        message = `${field} already exists`;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((e) => e.message).join(', ');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Your session is invalid. Please sign in again.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Your session has expired. Please sign in again.';
    }

    // Multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = 'File is too large. Avatars must be under 4MB, banners under 5MB.';
    }

    // Multer file type error
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        statusCode = 400;
        message = 'Unexpected file field.';
    }

    // Multer file filter error (wrong file type)
    if (err.message === 'Only image files are allowed') {
        statusCode = 400;
        message = 'Only PNG, JPG, JPEG, and WEBP images are allowed.';
    }

    // Cloudinary errors
    if (err.http_code && err.message?.includes('cloudinary')) {
        statusCode = 500;
        message = 'Image upload failed. Please try again.';
    }

    // Log errors
    const logEntry = {
        status: statusCode,
        method: req.method,
        url: req.originalUrl,
        message,
        ...(statusCode >= 500 && { stack: err.stack }),
    };

    if (statusCode >= 500) {
        console.error('[ERROR]', JSON.stringify(logEntry, null, 2));
    } else if (NODE_ENV === 'development') {
        console.warn(`[${statusCode}] ${req.method} ${req.originalUrl} — ${message}`);
    }

    const response = {
        success: false,
        message,
        ...(NODE_ENV === 'development' && { stack: err.stack }),
    };

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
