const mongoose = require('mongoose');

const { Schema } = mongoose;

const articleSchema = new Schema({
    title:   { type: String, trim: true },
    summary: { type: String, trim: true },
    text:    { type: String, trim: true },
    author:  { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Author is required'] },
    banner:  String,
    bannerPublicId: String,
    tags:    [String],
    published:     { type: Boolean, default: false },
    datePublished: Date,
    link:          String,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

const virtualDefs = [
    { name: 'likes',        ref: 'Like',    count: false },
    { name: 'likeCount',    ref: 'Like',    count: true  },
    { name: 'comments',     ref: 'Comment', count: false },
    { name: 'commentCount', ref: 'Comment', count: true  },
    { name: 'views',        ref: 'View',    count: false },
    { name: 'viewCount',    ref: 'View',    count: true  },
];

for (const { name, ref, count } of virtualDefs) {
    articleSchema.virtual(name, {
        ref,
        localField: '_id',
        foreignField: 'article',
        justOne: false,
        count,
    });
}

articleSchema.pre('save', function () {
    this.link = `https://uncensored.vercel.app/articles/${this._id}`;
});

articleSchema.pre('deleteOne', { document: true, query: false }, async function () {
    await mongoose.model('Comment').deleteMany({ article: this._id });
    await mongoose.model('Reply').deleteMany({ article: this._id });
    await mongoose.model('Like').deleteMany({ article: this._id });
    await mongoose.model('View').deleteMany({ article: this._id });
});

module.exports = mongoose.model('Article', articleSchema);
