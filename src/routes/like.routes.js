const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schema = require('../validators/like.validator');
const ctrl = require('../controllers/like.controller');

const router = Router({ mergeParams: true });

router.post('/',   authenticate, validate(schema.toggleLike), ctrl.toggleLike);
router.get('/',    authenticate, ctrl.getLikesByCategory);
router.get('/me',      authenticate, ctrl.getLikesByLoggedInUser);
router.get('/me/ids',  authenticate, ctrl.getMyLikedArticleIds);

module.exports = router;
