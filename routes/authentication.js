const express = require("express");
const multer = require('multer');
const {register, login, loggedInUser, forgotPassword, logout, logoutAll, resetPassword, updateProfile} = require("../controllers/authentication");
const {auth} = require("../middleware/auth");
const router = express.Router();

const avatar = multer({
    limits: {
        fileSize: 2 * 1000 * 1024
    },
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error('invalid file type'), false);
        }
        cb(null, true);
    }
});

updateProfileError = (error, req, res, next) => {
    res.status(400).json({error: error.message});
}

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth,  loggedInUser);
router.patch('/me', auth, avatar.single('avatar'), updateProfile, updateProfileError);

module.exports = router;