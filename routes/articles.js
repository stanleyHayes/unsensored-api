const express = require("express");
const multer = require('multer');

const {createArticle, deleteArticle, getArticle, getArticles, updateArticle, getArticlesBySubscriptions} = require("../controllers/articles");
const {auth} = require("../middleware/auth");
const likesRouter = require('../routes/likes');

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

router.post('/', auth, article.single('banner'), createArticle, articleError);
router.get('/', auth, getArticles);
router.get('/timeline', getArticlesBySubscriptions);
router.delete('/:id', auth, deleteArticle);
router.patch('/:id', auth, updateArticle);
router.get('/:id', getArticle);

module.exports = router;