const { NODE_ENV } = require('../config/config');

const errorHandler = (err, _req, res, _next) => {
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
        message = `Duplicate value for: ${field}`;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((e) => e.message).join(', ');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // Multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = 'File too large';
    }

    const response = {
        success: false,
        message,
        ...(NODE_ENV === 'development' && { stack: err.stack }),
    };

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
