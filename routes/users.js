const express = require('express');
const router = express.Router({mergeParams: true});
const {auth, authorize} = require('../middleware/auth');
const {createUser, deleteUser, getUser, getUsers, updateUser} = require('../controllers/users');

router.post('/', auth, authorize('ADMIN', 'SUPER_ADMIN'), createUser);
router.patch('/:username', auth, authorize('ADMIN', 'SUPER_ADMIN'), updateUser);
router.get('/:id', auth, getUser);
router.delete('/:', auth, authorize('ADMIN', 'SUPER_ADMIN'), deleteUser);
router.get('/', auth, authorize('ADMIN', 'SUPER_ADMIN'), getUsers);


module.exports = router;