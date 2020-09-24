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
    likes: {
        type: [Schema.Types.ObjectId],
        ref: 'User'
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

const Reply = mongoose.model('Reply', replySchema);

module.exports = Reply;