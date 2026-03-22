const mongoose = require('mongoose');

const { Schema } = mongoose;

const followSchema = new Schema({
    follower:  { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Follower is required'] },
    following: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Following is required'] },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Prevent duplicate follows
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Prevent self-follow
followSchema.pre('save', function () {
    if (this.follower.toString() === this.following.toString()) {
        throw new Error('You cannot follow yourself');
    }
});

module.exports = mongoose.model('Follow', followSchema);
