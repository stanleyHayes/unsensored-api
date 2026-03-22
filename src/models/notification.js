const mongoose = require('mongoose');

const { Schema } = mongoose;

const notificationSchema = new Schema({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['LIKE_ARTICLE', 'LIKE_COMMENT', 'LIKE_REPLY', 'COMMENT_ARTICLE', 'REPLY_COMMENT', 'FOLLOW_USER'],
        required: true,
    },
    article: { type: Schema.Types.ObjectId, ref: 'Article' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    reply:   { type: Schema.Types.ObjectId, ref: 'Reply' },
    read:    { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
