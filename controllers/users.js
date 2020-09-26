const User = require('../models/user');

exports.createUser = async (req, res) => {
    try {
        let user = new User({
            username: req.body.username,
            email: req.body.email,
            name: req.body.name,
            password: req.body.password
        });

        await user.save();
        user = await User.findById(user._id);
        res.status(201).json({data: user});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .populate('views')
            .populate('likes')
            .populate('comments')
            .populate('replies');
        res.status(201).json({data: users});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

exports.getUser = async (req, res) => {
    try {
        let user = await User.findById(req.params.id)
            .populate('views')
            .populate('likes')
            .populate('comments')
            .populate('replies');
        if (!user) {
            return res.status(404).json({error: 'user not found'});
        }
        res.status(200).json({data: user});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

exports.updateUser = async (req, res) => {
    try {
        let user = await User.findOne({username: req.params.username});
        if (!user) {
            return res.status(404).json({error: 'user not found'});
        }
        const updates = Object.keys(req.body);
        const allowedUpdates = ['email', 'username', 'password', 'name', 'isActive'];
        const isAllowed = updates.every(update => allowedUpdates.includes(update));
        if (!isAllowed) {
            return res.status(400).json({error: 'update not allowed '});
        }

        for (let key of updates) {
            user[key] = req.body[key];
        }
        await user.save();
        res.status(200).json({data: user});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}


exports.deleteUser = async (req, res) => {
    try {
        let user = await User.findOne({username: req.params.username});
        if (!user) {
            return res.status(404).json({error: 'user not found'});
        }
        await user.remove();
        res.status(200).json({data: user});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}