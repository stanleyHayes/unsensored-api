const Joi = require('joi');

const createArticle = Joi.object({
    title: Joi.string().trim().required(),
    summary: Joi.string().trim().required(),
    text: Joi.string().required(),
    tags: Joi.string().required(),
    datePublished: Joi.date(),
    published: Joi.boolean(),
});

const updateArticle = Joi.object({
    title: Joi.string().trim(),
    summary: Joi.string().trim(),
    text: Joi.string(),
    tags: Joi.string(),
    datePublished: Joi.date(),
    published: Joi.boolean(),
}).min(1);

const queryArticles = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string(),
    published: Joi.boolean(),
    tags: Joi.string(),
});

module.exports = { createArticle, updateArticle, queryArticles };
