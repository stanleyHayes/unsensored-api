const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const viewSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'author required']
    },
    article: {
        type: Schema.Types.ObjectId,
        ref: 'Article',
        required: [true, 'article required']
    }
}, {timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}});

const View = mongoose.model('View', viewSchema);

module.exports = View;