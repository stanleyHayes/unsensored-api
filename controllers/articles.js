const Article = require('../models/article');

exports.createArticle = async (req, res) => {
    try {
        let article = new Article({
            title: req.body.title,
            banner: new Buffer.from(JSON.parse(req.file.buffer).data, 'base64'),
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
        console.log(req.query);

        if (req.query.sort) {
            let parts = req.query.sort.split(':');
            sort['datePublished'] = parts[1] === 'asc' ? 1 : -1;
        }
        //api/v1/users/:user/articles
        //get articles authored by user
        if (req.params.user) {
            query = Article.find({author: req.params.user})
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
        } else {
            //api/v1/articles?tags=&sortBy=field:value&published=value&
            query = Article.find(match)
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