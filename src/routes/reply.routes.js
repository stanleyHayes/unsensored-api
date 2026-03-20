const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schema = require('../validators/reply.validator');
const ctrl = require('../controllers/reply.controller');

const router = Router({ mergeParams: true });

router.use('/:reply/likes', require('./like.routes'));

router.post('/',       authenticate, validate(schema.createReply), ctrl.createReply);
router.get('/',        authenticate, ctrl.getReplies);
router.get('/:id',     authenticate, ctrl.getReply);
router.patch('/:id',   authenticate, validate(schema.updateReply), ctrl.updateReply);
router.delete('/:id',  authenticate, ctrl.deleteReply);

module.exports = router;
