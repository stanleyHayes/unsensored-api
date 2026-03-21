const mongoose = require('mongoose');

const { Schema } = mongoose;

const bookmarkSchema = new Schema({
    author:  { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Author is required'] },
    article: { type: Schema.Types.ObjectId, ref: 'Article', required: [true, 'Article is required'] },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Prevent duplicate bookmarks
bookmarkSchema.index({ author: 1, article: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
