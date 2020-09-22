const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const articleSchema = new Schema({
    title: {
        type: String,
        required: [true, 'title required'],
        trim: true
    },
    summary: {
        type: String,
        required: [true, 'summary required'],
        trim: true
    },
    text: {
        type: String,
        required: [true, 'text required'],
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
    likes: {
        type: [Schema.Types.ObjectId],
        ref: 'User'
    }
}, {timestamps: true});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;