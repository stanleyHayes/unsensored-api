const Article = require('../models/article');

exports.createArticle = async (req, res) => {
    try {
        let article = new Article({
            title: req.body.title,
            banner: req.file.buffer,
            summary: req.body.summary,
            text: req.body.text,
            tags: JSON.parse(req.body.tags),
            author: req.user
        });
        await article.save();
        res.status(201).json({
            data: article
        });
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

exports.getArticle = async (req, res) => {
    try {
        let article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({error: 'Article not found'});
        }
        return res.status(200).json({data: article});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

exports.getArticles = async (req, res) => {
    try {
        let query;
        let page = req.query.page || 1;
        let limit = parseInt(req.query.limit) || 20;
        let skip = (page - 1) * limit;
        let sort = {};
        let match = {};
        if (req.query.sort) {
            let parts = req.query.sort.split(':');
            sort['datePublished'] = parts[1] === 'asc' ? 1 : -1;
        }
        let tags;

        //logged in user
        tags = req.user.subscriptions;
        if (tags.length > 0) {
            query = Article.find({tags: {$all: tags}, published: true})
                .skip(skip)
                .limit(limit)
                .sort(sort)
                .populate({
                    path: 'author',
                    select: 'avatar name username'
                });
        } else if (req.params.user) {
            query = Article.find({author: req.params.user})
                .skip(skip)
                .limit(limit)
                .sort(sort)
                .populate({
                    path: 'author',
                    select: 'avatar name username'
                });
        } else {

            query = Article.find({published: true})
                .skip(skip)
                .limit(limit)
                .sort(sort)
                .populate({
                    path: 'author',
                    select: 'avatar name username'
                });
        }

        const articles = await query;
        return res.status(200).json({data: articles});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

exports.updateArticle = async (req, res) => {
    try {
        let article = await Article.findOne({_id: req.params.id});
        if (!article) {
            return res.status(404).json({error: 'Article not found'});
        }
        const updates = Object.keys(req.body);
        const allowedUpdates = ['text', 'summary', 'title', 'datePublished', 'published', 'tags', 'banner'];
        const isAllowed = updates.every(update => allowedUpdates.includes(update));
        if (!isAllowed) {
            return res.status(400).json({error: 'updates not allowed'});
        }

        for (let key of updates) {
            article[key] = req.body[key];
        }
        await article.save();
        return res.status(200).json({data: article});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

exports.deleteArticle = async (req, res) => {
    try {
        const article = await Article.findOne({_id: req.params.id, author: req.user._id});
        if (!article) {
            return res.status(404).json({error: 'Article not found'});
        }
        await article.remove();
        res.status(200).json({data: article});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

exports.getArticlesBySubscriptions = async (req, res) => {
    try {
        let query;
        let page = req.query.page || 1;
        let limit = parseInt(req.query.limit) || 20;
        let skip = (page - 1) * limit;
        let sort = {};
        let match = {};
        if (req.query.sort) {
            let parts = req.query.sort.split(':');
            sort['datePublished'] = parts[1] === 'asc' ? 1 : -1;
        }
        let tags;

            tags = req.user.subscriptions;
            if (tags.length === 0) {
                query = Article.find({published: true})
                    .skip(skip)
                    .limit(limit)
                    .sort(sort)
                    .populate({
                        path: 'author',
                        select: 'avatar name username'
                    });
            } else if(tags > 0) {
                query = Article.find({tags: {$all: tags}, published: true})
                    .skip(skip)
                    .limit(limit)
                    .sort(sort)
                    .populate({
                        path: 'author',
                        select: 'avatar name username'
                    });
            }
        //anonymous user
        else {
            query = Article.find({published: true})
                .skip(skip)
                .limit(limit)
                .sort(sort)
                .populate({
                    path: 'author',
                    select: 'avatar name username'
                });
        }

        const articles = await query;
        return res.status(200).json({data: articles});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

