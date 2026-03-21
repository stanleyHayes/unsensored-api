const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/bookmark.controller');

const router = Router({ mergeParams: true });

router.post('/',          authenticate, ctrl.toggleBookmark);
router.get('/me',         authenticate, ctrl.getMyBookmarks);
router.get('/me/ids',     authenticate, ctrl.getMyBookmarkIds);
router.get('/article/:articleId', authenticate, ctrl.getBookmarksByArticle);

module.exports = router;
