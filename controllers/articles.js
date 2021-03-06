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
            author: req.user,
            datePublished: req.body.datePublished,
            published: req.body.published
        });

        await article.save();

        article = await Article.findById(article._id)
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
        let page = req.query && req.query.page || 1;
        let limit = req.query && parseInt(req.query.limit) || 20;
        let skip = (page - 1) * limit;
        let sort = {
            updatedAt: -1
        };
        let match = {};

        if (req.query && req.query.sortBy) {
            let parts = req.query.sort.split(':');
            sort['datePublished'] = parts[1] === 'asc' ? 1 : -1;
        }

        if (req.query && req.query.published) {
            match.published = Boolean(req.query.published);
        }

        //api/v1/articles?tags=&sortBy=field:value&published=value&
        query = Article.find({...match});

        if (req.query && req.query.tags) {
            const tags = req.query.tags.split(',');
            query = Article.find({...match, $all: {tags: [tags]}});
        }

        if (req.params && req.params.user) {
            query = query.where({author: req.params.user});
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
            }).populate({
                path: 'likes'
            });

        const articles = await query;
        return res.status(200).json({data: articles});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

exports.updateArticle = async (req, res) => {
    try {
        let article = await Article.findOne({_id: req.params.id, author: req.user._id});

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
            if (key === 'tags') {
                article['tags'] = req.body.tags.split(',');
                continue;
            }
            article[key] = req.body[key];
        }
        if (req.file && req.file.buffer) {
            article["banner"] = parser.format(".png", req.file.buffer).content;
        }
        await article.save();
        article = await Article.findById(req.params.id)
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
        return res.status(200).json({data: article});
    } catch (e) {
        console.log(e.message)
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
        let sort = {
            updatedAt: -1
        };
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

        const articles = await query;
        return res.status(200).json({data: articles});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}
