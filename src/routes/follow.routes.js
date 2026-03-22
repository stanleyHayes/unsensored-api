const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/follow.controller');

const router = Router({ mergeParams: true });

router.post('/',                  authenticate, ctrl.toggleFollow);
router.get('/me/ids',             authenticate, ctrl.getMyFollowingIds);
router.get('/:userId/followers',  authenticate, ctrl.getFollowers);
router.get('/:userId/following',  authenticate, ctrl.getFollowing);
router.get('/:userId/counts',     authenticate, ctrl.getFollowCounts);

module.exports = router;
