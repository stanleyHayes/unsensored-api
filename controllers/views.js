const View = require('../models/view');

exports.createView = async (req, res) => {
    try {
        let view = await View.findOne({author: req.user._id, article: req.body.article});
        if (view) {
            return res.status(200).json({data: {}});
        }
        view = await View.create({author: req.user._id, article: req.body.article});
        res.status(201).json({data: view});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

exports.getViews = async (req, res) => {
    try {
        //get views by article, get views by user

        res.status(200).json({data: {}})
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}