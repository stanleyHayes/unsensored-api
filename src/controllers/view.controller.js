const View = require('../models/view');
const Article = require('../models/article');
const catchAsync = require('../utils/catch-async');
const updateTagAffinity = require('../utils/update-tag-affinity');

exports.createView = catchAsync(async (req, res) => {
    // Skip tracking for unauthenticated users
    if (!req.user) {
        return res.status(200).json({ success: true, data: null });
    }

    // Upsert — if already viewed, no-op
    const view = await View.findOneAndUpdate(
        { author: req.user._id, article: req.body.article },
        { author: req.user._id, article: req.body.article },
        { upsert: true, returnDocument: 'after' },
    );

    // Update tag affinities on view
    const articleDoc = await Article.findById(req.body.article).select('tags').lean();
    if (articleDoc) updateTagAffinity(req.user._id, articleDoc.tags, 1);

    res.status(201).json({ success: true, data: view });
});

exports.getViews = catchAsync(async (req, res) => {
    const filter = {};
    if (req.params.article) filter.article = req.params.article;
    if (req.params.user) filter.author = req.params.user;

    const views = await View.find(filter)
        .populate({ path: 'author', select: 'name username avatar' })
        .populate({ path: 'article', select: 'title summary' });

    res.status(200).json({ success: true, data: views });
});
