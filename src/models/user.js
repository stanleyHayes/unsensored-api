const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

const { Schema } = mongoose;

const tokenSchema = new Schema({
    token: String,
    platform: String,
    browser: String,
    isMobile: Boolean,
    isDesktop: Boolean,
    isAndroid: Boolean,
    isIphone: Boolean,
}, { _id: false, timestamps: { createdAt: true, updatedAt: false } });

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    username: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: [true, 'Username is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        validate: {
            validator: (v) => validator.isEmail(v),
            message: 'Invalid email address',
        },
    },
    avatar: String,
    avatarPublicId: String,
    password: {
        type: String,
        trim: true,
        minlength: [6, 'Password must be at least 6 characters'],
        select: false,
    },
    subscriptions: [String],
    isActive: { type: Boolean, default: true },
    role: {
        type: String,
        enum: ['USER', 'ADMIN', 'SUPER_ADMIN'],
        default: 'USER',
    },
    tokens: [tokenSchema],
    profile: String,
    birthday: Date,
    tagAffinities: [{ tag: String, score: { type: Number, default: 0 } }],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// --- Virtuals ---
const virtualDefs = [
    { name: 'likes',        ref: 'Like',    count: false },
    { name: 'likeCount',    ref: 'Like',    count: true  },
    { name: 'comments',     ref: 'Comment', count: false },
    { name: 'commentCount', ref: 'Comment', count: true  },
    { name: 'views',        ref: 'View',    count: false },
    { name: 'viewCount',    ref: 'View',    count: true  },
    { name: 'replies',      ref: 'Reply',   count: false },
    { name: 'replyCount',   ref: 'Reply',   count: true  },
    { name: 'articles',     ref: 'Article', count: false },
    { name: 'articleCount', ref: 'Article', count: true  },
];

for (const { name, ref, count } of virtualDefs) {
    userSchema.virtual(name, {
        ref,
        localField: '_id',
        foreignField: 'author',
        justOne: false,
        count,
    });
}

userSchema.virtual('followerCount', {
    ref: 'Follow',
    localField: '_id',
    foreignField: 'following',
    justOne: false,
    count: true,
});

userSchema.virtual('followingCount', {
    ref: 'Follow',
    localField: '_id',
    foreignField: 'follower',
    justOne: false,
    count: true,
});

// --- Hooks ---
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// --- Methods ---
userSchema.methods.generateToken = async function (deviceInfo) {
    const token = jwt.sign({ _id: this._id.toString() }, JWT_SECRET);
    this.tokens.push({ token, ...deviceInfo });
    return token;
};

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.tokens;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
