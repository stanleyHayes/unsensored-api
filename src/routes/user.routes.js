const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/user.controller');

const router = Router({ mergeParams: true });

// Nested routes
router.use('/:user/comments', require('./comment.routes'));
router.use('/:user/articles', require('./article.routes'));
router.use('/:user/likes',    require('./like.routes'));
router.use('/:user/views',    require('./view.routes'));
router.use('/:user/replies',  require('./reply.routes'));

router.get('/',      authenticate, ctrl.getUsers);
router.get('/:id',   authenticate, ctrl.getUser);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), ctrl.deleteUser);

module.exports = router;
