const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { avatarUpload } = require('../middleware/upload');
const validate = require('../middleware/validate');
const schema = require('../validators/auth.validator');
const ctrl = require('../controllers/auth.controller');

const router = Router();

router.post('/register', validate(schema.register), ctrl.register);
router.post('/login',    validate(schema.login), ctrl.login);
router.get('/me',        authenticate, ctrl.getMe);
router.patch('/me',      authenticate, avatarUpload.single('avatar'), validate(schema.updateProfile), ctrl.updateProfile);
router.post('/logout',   authenticate, ctrl.logout);
router.post('/logout-all', authenticate, ctrl.logoutAll);

module.exports = router;
