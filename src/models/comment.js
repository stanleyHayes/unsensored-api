const mongoose = require('mongoose');

const { Schema } = mongoose;

const commentSchema = new Schema({
    text:    { type: String, required: [true, 'Text is required'], trim: true },
    author:  { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Author is required'] },
    article: { type: Schema.Types.ObjectId, ref: 'Article', required: [true, 'Article is required'] },
    link:    String,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

commentSchema.virtual('likes', {
    ref: 'Like', localField: '_id', foreignField: 'comment', justOne: false,
});

commentSchema.virtual('likeCount', {
    ref: 'Like', localField: '_id', foreignField: 'comment', justOne: false, count: true,
});

commentSchema.virtual('replies', {
    ref: 'Reply', localField: '_id', foreignField: 'comment', justOne: false,
});

commentSchema.virtual('replyCount', {
    ref: 'Reply', localField: '_id', foreignField: 'comment', justOne: false, count: true,
});

commentSchema.pre('deleteOne', { document: true, query: false }, async function () {
    await mongoose.model('Reply').deleteMany({ comment: this._id });
    await mongoose.model('Like').deleteMany({ comment: this._id });
});

module.exports = mongoose.model('Comment', commentSchema);
