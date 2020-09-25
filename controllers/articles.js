const Article = require('../models/article');
const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();

exports.createArticle = async (req, res) => {
    try {
        let article = new Article({
            title: req.body.title,
            banner: parser.format('.png', req.file.buffer).content,
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
        let article = await Article.findById(req.params.id)
            .populate({
                path: 'author',
                select: 'avatar name username'
            })
            .populate({
                path: 'comments'
            })
            .populate({
                path: 'likes'
            })
            .populate({
                path: 'views'
            })
            .populate({
                path: 'commentCount'
            })
            .populate({
                path: 'likeCount'
            })
            .populate({
                path: 'viewCount'
            });
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

        if (req.query.sortBy) {
            let parts = req.query.sort.split(':');
            sort['datePublished'] = parts[1] === 'asc' ? 1 : -1;
        }

        if (req.query.published) {
            match.published = Boolean(req.query.published);
        }

        //api/v1/articles?tags=&sortBy=field:value&published=value&
        query = Article.find({author: req.user._id, ...match});

        if (req.query.tags) {
            const tags = req.query.tags.split(',');
            query = Article.find({...match, $all: {tags: [tags]}});
        }

        query = query
            .skip(skip)
            .limit(limit)
            .sort(sort)
            .populate({
                path: 'author',
                select: 'avatar name username'
            })
            .populate({
                path: 'commentCount'
            })
            .populate({
                path: 'likeCount'
            })
            .populate({
                path: 'viewCount'
            });

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

exports.getAuthoredArticles = async (req, res) => {
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

        if (req.query.published) {
            match.published = Boolean(req.query.published);
        }

        //api/v1/articles?tags=&sortBy=field:value&published=value&
        query = Article.find({author: req.user._id, ...match});

        if (req.query.tags) {
            const tags = req.query.tags.split(',');
            query = Article.find({author: req.user._id, ...match, $all: {tags: [tags]}});
        }

        query = query
            .skip(skip)
            .limit(limit)
            .sort(sort)
            .populate({
                path: 'author',
                select: 'avatar name username'
            })
            .populate({
                path: 'commentCount'
            })
            .populate({
                path: 'likeCount'
            })
            .populate({
                path: 'viewCount'
            });

        const articles = await query;
        return res.status(200).json({data: articles});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}
