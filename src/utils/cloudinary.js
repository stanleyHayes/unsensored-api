const { v2: cloudinary } = require('cloudinary');
const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
} = require('../config/config');

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer from multer
 * @param {Object} options - { folder, width, height, crop, ... }
 * @returns {Promise<{ url, publicId }>}
 */
const uploadToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder: options.folder || 'unsensored',
            resource_type: 'image',
            ...options,
        };

        const stream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        stream.end(buffer);
    });
};

/**
 * Delete an image from Cloudinary by public ID.
 */
const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    return cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, cloudinary };
