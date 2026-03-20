const mongoose = require('mongoose');

const { Schema } = mongoose;

const replySchema = new Schema({
    text:    { type: String, required: [true, 'Text is required'], trim: true },
    author:  { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Author is required'] },
    article: { type: Schema.Types.ObjectId, ref: 'Article' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

replySchema.virtual('likes', {
    ref: 'Like', localField: '_id', foreignField: 'reply', justOne: false,
});

replySchema.virtual('likeCount', {
    ref: 'Like', localField: '_id', foreignField: 'reply', justOne: false, count: true,
});

replySchema.pre('deleteOne', { document: true, query: false }, async function () {
    await mongoose.model('Like').deleteMany({ reply: this._id });
});

module.exports = mongoose.model('Reply', replySchema);
