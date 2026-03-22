const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schema = require('../validators/comment.validator');
const ctrl = require('../controllers/comment.controller');

const router = Router({ mergeParams: true });

// Nested routes
router.use('/:comment/replies', require('./reply.routes'));
router.use('/:comment/likes',  require('./like.routes'));

router.post('/',       authenticate, validate(schema.createComment), ctrl.createComment);
router.get('/',        ctrl.getComments);
router.get('/:id',     ctrl.getComment);
router.patch('/:id',   authenticate, validate(schema.updateComment), ctrl.updateComment);
router.delete('/:id',  authenticate, ctrl.deleteComment);

module.exports = router;
