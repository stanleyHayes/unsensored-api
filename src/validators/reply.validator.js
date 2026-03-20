const Joi = require('joi');

const createReply = Joi.object({
    text: Joi.string().trim().required(),
    article: Joi.string().hex().length(24).required(),
    comment: Joi.string().hex().length(24).required(),
});

const updateReply = Joi.object({
    text: Joi.string().trim().required(),
});

module.exports = { createReply, updateReply };
