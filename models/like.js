const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const likeSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'author required']
    },
    reply: {
        type: Schema.Types.ObjectId,
        ref: 'Reply'
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


const Like = mongoose.model('Like', likeSchema);

module.exports = Like;