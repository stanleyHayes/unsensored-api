const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/notification.controller');

const router = Router();

router.get('/',             authenticate, ctrl.getNotifications);
router.patch('/read-all',   authenticate, ctrl.markAllAsRead);
router.patch('/:id/read',   authenticate, ctrl.markAsRead);

module.exports = router;
