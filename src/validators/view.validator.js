const Joi = require('joi');

const createView = Joi.object({
    article: Joi.string().hex().length(24).required(),
});

module.exports = { createView };
