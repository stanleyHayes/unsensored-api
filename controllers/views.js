const View = require('../models/view');

exports.createView = async (req, res) => {
    try {
        let view = await View.findOne({author: req.user._id, article: req.body.article});
        if (view) {
            return res.status(200).json({data: null});
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
        let views = [];
        if(req.params.article){
            views = await View.find({article: req.params.article}).populate('author');
        }
        if(req.params.user){
            views = await View.find({author: req.params.author}).populate('article');
        }

        console.log(views);

        res.status(200).json({data: views});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}