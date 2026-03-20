const Joi = require('joi');

const toggleLike = Joi.object({
    type: Joi.string().valid('ARTICLE', 'COMMENT', 'REPLY').required(),
    article: Joi.string().hex().length(24).when('type', { is: 'ARTICLE', then: Joi.required() }),
    comment: Joi.string().hex().length(24).when('type', { is: 'COMMENT', then: Joi.required() }),
    reply: Joi.string().hex().length(24).when('type', { is: 'REPLY', then: Joi.required() }),
});

module.exports = { toggleLike };
