const User = require("../models/user");

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
        res.status(200).json({data: req.user, token: req.token})
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

    }catch (e) {

    }
}