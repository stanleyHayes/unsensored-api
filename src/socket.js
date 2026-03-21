const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const { JWT_SECRET } = require('./config/config');

let io;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    // Authenticate socket connections via JWT
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error('Authentication required'));

            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
            if (!user) return next(new Error('Authentication required'));

            socket.userId = user._id.toString();
            socket.user = { _id: user._id, name: user.name, username: user.username };
            next();
        } catch (err) {
            next(new Error('Authentication required'));
        }
    });

    io.on('connection', (socket) => {
        // Auto-join a personal room for user-specific events
        socket.join(`user:${socket.userId}`);

        // Join an article room (for real-time likes/comments/replies on that article)
        socket.on('article:join', (articleId) => {
            socket.join(`article:${articleId}`);
        });

        socket.on('article:leave', (articleId) => {
            socket.leave(`article:${articleId}`);
        });

        socket.on('disconnect', () => {});
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

// Safe emit that never throws — socket failures must not break REST responses
const emitEvent = (room, event, data) => {
    try {
        if (!io) return;
        if (room) {
            io.to(room).emit(event, data);
        } else {
            io.emit(event, data);
        }
    } catch (err) {
        console.error(`Socket emit error [${event}]:`, err.message);
    }
};

module.exports = { initSocket, getIO, emitEvent };
