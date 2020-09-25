const User = require("../models/user");
const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();

exports.register = async (req, res) => {
    try {
        let user = {
            name: req.body.name,
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        };
        user = await User.create(user);
        const token = await user.getToken(req.useragent);
        await user.save();
        res.status(201).json({data: user, token: token});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

exports.login = async (req, res) => {
    try {
        const {username, password} = req.body;
        let user = await User.findOne({username});

        if (!user) {
            return res.status(401).json({error: 'Authentication failed'});
        }

        if (!user.matchPassword(password)) {
            return res.status(401).json({error: 'Authentication failed'});
        }

        const token = await user.getToken(req.useragent);
        await user.save();
        res.status(200).json({data: user, token});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

exports.loggedInUser = async (req, res) => {
    try {
        req.user
            .populate({
                path: 'views',
                populate: {
                    path: 'article',
                    select: 'summary _id title'
                }
            })
            .populate({
                path: 'comments',
                populate: {
                    path: 'comment',
                    select: 'text article',
                    populate: {
                        path: 'article',
                        select: '_id title'
                    }
                }
            }).populate({
            path: 'likes'
        }).execPopulate();

        const user = await User.findById(req.user._id).populate('likes').populate('comments').populate('views');

        res.status(200).json({data: req.user, token: req.token});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

exports.logout = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();
        res.status(200).json({
            message: 'logged out successfully'
        });
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

exports.logoutAll = async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).json({
            message: 'logged out successfully'
        });
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

exports.resetPassword = async (req, res) => {
    try {

    } catch (e) {

    }
}

exports.forgotPassword = async (req, res) => {
    try {

    } catch (e) {

    }
}

exports.changePassword = async (req, res) => {
    try {

    } catch (e) {

    }
}

exports.updateProfile = async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['username', "name", 'email'];
        const isAllowed = updates.every(update => allowedUpdates.includes(update));
        if (!isAllowed) {
            return res.status(400).json({error: 'action not allowed'});
        }
        for (let key of updates) {
            req.user[key] = req.body[key];
        }
        if (req.file.buffer) {
            req.user.avatar = parser.format('.png', req.file.buffer).content;
        }
        await req.user.save();

        req.user.populate({
            path: 'views',
            populate: {
                path: 'article',
                select: 'summary _id title'
            }
        })
            .populate({
                path: 'comments',
                populate: {
                    path: 'comment',
                    select: 'text article',
                    populate: {
                        path: 'article',
                        select: '_id title'
                    }
                }
            }).populate({
            path: 'likes'
        }).execPopulate();

        res.status(200).json({data: req.user});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}