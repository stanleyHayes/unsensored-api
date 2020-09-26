const mongoose = require('mongoose');
const Reply = require('./reply');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
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
    article: {
        type: Schema.Types.ObjectId,
        required: [true, 'article required'],
        ref: 'Article'
    },
    link: {
        type: String
    }
}, {timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}});

commentSchema.virtual('likes', {
    justOne: false,
    ref: 'Like',
    localField:'_id',
    foreignField: 'comment'
});

commentSchema.virtual('likeCount', {
    justOne: false,
    ref: 'Like',
    localField:'_id',
    foreignField: 'comment',
    count: true
});

commentSchema.virtual('replies', {
    justOne: false,
    ref: 'Reply',
    localField:'_id',
    foreignField: 'comment'
});

commentSchema.virtual('replyCount', {
    justOne: false,
    ref: 'Reply',
    localField:'_id',
    foreignField: 'comment',
    count: true
});

commentSchema.pre('remove', async function (next) {
    await Reply.deleteMany({comment: this._id});
    next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;