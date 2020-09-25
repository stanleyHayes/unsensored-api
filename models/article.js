const mongoose = require('mongoose');
const Comment = require('./comment');
const Reply = require('./reply');

const Schema = mongoose.Schema;

const articleSchema = new Schema({
    title: {
        type: String,
        trim: true
    },
    summary: {
        type: String,
        trim: true
    },
    text: {
        type: String,
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'author required']
    },
    banner: {
        type: Buffer
    },
    tags: {
        type: [String]
    },
    published: {
        type: Boolean,
        default: false
    },
    datePublished: {
        type: Date
    },
    link: {
        type: String
    }
}, {timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}});


articleSchema.virtual('likes', {
    localField: '_id',
    foreignField: 'article',
    justOne: false,
    ref: 'Like'
});

articleSchema.virtual('comments', {
    localField: '_id',
    foreignField: 'article',
    justOne: false,
    ref: 'Comment'
});

articleSchema.virtual('views', {
    localField: '_id',
    foreignField: 'article',
    justOne: false,
    ref: 'View'
});

articleSchema.virtual('likeCount', {
    localField: '_id',
    foreignField: 'article',
    justOne: false,
    ref: 'Like',
    count: true
});

articleSchema.virtual('commentCount', {
    localField: '_id',
    foreignField: 'article',
    justOne: false,
    ref: 'Comment',
    count: true
});

articleSchema.virtual('viewCount', {
    localField: '_id',
    foreignField: 'article',
    justOne: false,
    ref: 'View',
    count: true
});

articleSchema.pre('save', async function (next) {
    this.link = `https://uncensored.vercel.app/articles/${this._id}`;
    next();
});

articleSchema.pre('remove', async function (next) {
    await Comment.deleteMany({article: this._id});
    await Reply.deleteMany({article: this._id});
    next();
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;