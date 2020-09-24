const View = require('../models/view');

exports.createView = async (req, res) => {
    try {
        res.status(201).json({data: {}})
    }catch (e) {
        res.status(500).json({error: e.message});
    }
}

exports.getViews = async (req, res) => {
    try {
        //get views by article, get views by user
        res.status(200).json({data: {}})
    }catch (e) {
        res.status(500).json({error: e.message});
    }
}