const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const replySchema = new Schema({
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
        ref: 'Article'
    },
    comment: {
    type: Schema.Types.ObjectId,
        ref: 'Comment'
}
}, {timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}});

replySchema.virtual('likeCount', {
    justOne: false,
    ref: 'Like',
    foreignField: 'reply',
    localField: '_id',
    count: true
});


replySchema.virtual('likes', {
    justOne: false,
    ref: 'Like',
    foreignField: 'reply',
    localField: '_id'
});

const Reply = mongoose.model('Reply', replySchema);

module.exports = Reply;