const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const useragent = require('express-useragent');
const logger = require('./middleware/logger');
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
app.use(logger);

// --- Health check ---
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

// --- Open Graph routes (serve dynamic meta tags to link preview bots) ---
const ogRoutes = require('./routes/og.routes');
const BOT_UA = /bot|crawler|spider|facebook|whatsapp|telegram|slack|twitter|linkedin|discord|preview|fetch|curl/i;
app.use('/og', ogRoutes);
app.use('/articles/:id', (req, res, next) => {
    const ua = req.get('user-agent') || '';
    if (BOT_UA.test(ua)) {
        return res.redirect(`/og/articles/${req.params.id}`);
    }
    next();
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
