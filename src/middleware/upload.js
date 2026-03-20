const multer = require('multer');

const imageFilter = (_req, file, cb) => {
    if (!file.originalname.match(/\.(png|jpg|jpeg|webp)$/i)) {
        return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
};

const avatarUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: imageFilter,
});

const bannerUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
});

module.exports = { avatarUpload, bannerUpload };
