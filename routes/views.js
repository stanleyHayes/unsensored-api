const express = require('express');
const {auth} = require('../middleware/auth');
const {createView, getViews} = require('../controllers/views');

const router = express.Router({mergeParams: true});

router.post('/', auth, createView);
router.get('/', auth, getViews);

module.exports = router;