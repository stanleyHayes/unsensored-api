const Notification = require('../models/notification');
const { emitEvent } = require('../socket');

const createNotification = async ({ recipient, sender, type, article, comment, reply }) => {
    try {
        if (recipient.toString() === sender.toString()) return;

        const notification = await Notification.create({ recipient, sender, type, article, comment, reply });
        await notification.populate('sender', 'name username avatar');

        emitEvent(`user:${recipient}`, 'notification:new', notification);
    } catch (err) {
        console.error('Notification error:', err.message);
    }
};

module.exports = createNotification;
