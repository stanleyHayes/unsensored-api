const mongoose = require('mongoose');

const { Schema } = mongoose;

const likeSchema = new Schema({
    author:  { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Author is required'] },
    article: { type: Schema.Types.ObjectId, ref: 'Article' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    reply:   { type: Schema.Types.ObjectId, ref: 'Reply' },
    type:    { type: String, enum: ['ARTICLE', 'COMMENT', 'REPLY'], required: [true, 'Like type is required'] },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Prevent duplicate likes — use partialFilterExpression so null fields don't collide
likeSchema.index({ author: 1, article: 1 }, { unique: true, partialFilterExpression: { type: 'ARTICLE' } });
likeSchema.index({ author: 1, comment: 1 }, { unique: true, partialFilterExpression: { type: 'COMMENT' } });
likeSchema.index({ author: 1, reply: 1 },   { unique: true, partialFilterExpression: { type: 'REPLY' } });

module.exports = mongoose.model('Like', likeSchema);
