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
    datePublished: {
        type: Date
    },
    article: {
        type: Schema.Types.ObjectId,
        required: [true, 'article required'],
        ref: 'Article'
    }
}, {timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}});

commentSchema.virtual('likes', {
    justOne: false,
    ref: 'Like',
    localField:'_id',
    foreignField: 'comment'
});

commentSchema.pre('remove', async function (next) {
    await Reply.deleteMany({comment: this._id});
    next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;