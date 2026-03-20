const Joi = require('joi');

const createComment = Joi.object({
    text: Joi.string().trim().required(),
    article: Joi.string().hex().length(24).required(),
});

const updateComment = Joi.object({
    text: Joi.string().trim().required(),
});

module.exports = { createComment, updateComment };
