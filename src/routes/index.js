const { Router } = require('express');

const router = Router();

router.use('/auth',     require('./auth.routes'));
router.use('/articles', require('./article.routes'));
router.use('/comments', require('./comment.routes'));
router.use('/replies',  require('./reply.routes'));
router.use('/users',    require('./user.routes'));
router.use('/views',    require('./view.routes'));
router.use('/likes',    require('./like.routes'));

module.exports = router;
