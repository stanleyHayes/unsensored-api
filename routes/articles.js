const express = require("express");
const multer = require('multer');

const {createArticle, deleteArticle, getArticle, getArticles, updateArticle, getAuthoredArticles} = require("../controllers/articles");
const {auth} = require("../middleware/auth");
const likesRouter = require('../routes/likes');
const commentRouter = require('../routes/comments');

const router = express.Router({mergeParams: true});

const article = multer({
    limits: {
        fileSize: 5 * 1000 * 1024
    },
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error('invalid file type'), false);
        }
        cb(null, true);
    }
});

articleError = (error, req, res, next) => {
    res.status(400).json({error: error.message});
}

router.use('/likes', likesRouter);
router.use('/:article/comments', commentRouter);

router.post('/', auth, article.single('banner'), createArticle, articleError);
router.get('/', auth, getArticles);
router.get('/me', auth, getAuthoredArticles);
router.delete('/:id', auth, deleteArticle);
router.patch('/:id', auth, article.single('banner'), updateArticle, articleError);
router.get('/:id', getArticle);

module.exports = router;