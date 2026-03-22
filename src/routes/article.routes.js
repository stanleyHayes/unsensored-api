const { Router } = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { bannerUpload } = require('../middleware/upload');
const validate = require('../middleware/validate');
const schema = require('../validators/article.validator');
const ctrl = require('../controllers/article.controller');

const router = Router({ mergeParams: true });

// Nested routes
router.use('/:article/likes',    require('./like.routes'));
router.use('/:article/comments', require('./comment.routes'));
router.use('/:article/views',    require('./view.routes'));

router.post('/',     authenticate, bannerUpload.single('banner'), ctrl.createArticle);
router.get('/',      optionalAuth, validate(schema.queryArticles, 'query'), ctrl.getArticles);
router.get('/me',       authenticate, ctrl.getAuthoredArticles);
router.get('/trending', optionalAuth, ctrl.getTrendingArticles);
router.get('/tags',     ctrl.getTags);
router.get('/:id',      optionalAuth, ctrl.getArticle);
router.patch('/:id', authenticate, bannerUpload.single('banner'), ctrl.updateArticle);
router.delete('/:id', authenticate, ctrl.deleteArticle);

module.exports = router;
