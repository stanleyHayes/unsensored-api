const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schema = require('../validators/view.validator');
const ctrl = require('../controllers/view.controller');

const router = Router({ mergeParams: true });

router.post('/', authenticate, validate(schema.createView), ctrl.createView);
router.get('/',  authenticate, ctrl.getViews);

module.exports = router;
