const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const useragent = require('express-useragent');
const rateLimit = require('express-rate-limit');
const { NODE_ENV } = require('./config/config');
const routes = require('./routes');
const errorHandler = require('./middleware/error-handler');
const AppError = require('./utils/app-error');

const app = express();

// --- Security ---
app.use(helmet());
app.use(cors());

// --- Body parsing ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(useragent.express());

// --- Logging ---
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// --- Health check ---
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

// --- API routes ---
app.use('/api/v1', routes);

// --- 404 handler ---
app.use((req, _res, next) => {
    next(new AppError(`Route not found: ${req.originalUrl}`, 404));
});

// --- Global error handler ---
app.use(errorHandler);

module.exports = app;
