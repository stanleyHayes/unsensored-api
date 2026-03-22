const logger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const user = req.user ? `[${req.user.username || req.user._id}]` : '[anonymous]';

        const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';
        const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
        const reset = '\x1b[0m';

        console.log(
            `${color}[${level}]${reset} ${req.method} ${req.originalUrl} ${color}${status}${reset} ${duration}ms ${user}`
        );
    });

    next();
};

module.exports = logger;
