const app = require('./src/app');
const connectDB = require('./src/config/database');
const { PORT, NODE_ENV } = require('./src/config/config');

const start = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running in ${NODE_ENV} on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

start();
