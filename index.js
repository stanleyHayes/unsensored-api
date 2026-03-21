const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { PORT, NODE_ENV } = require('./src/config/config');
const { initSocket } = require('./src/socket');

const start = async () => {
    try {
        await connectDB();

        const server = http.createServer(app);
        initSocket(server);

        server.listen(PORT, () => {
            console.log(`Server running in ${NODE_ENV} on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

start();
