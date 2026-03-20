const Joi = require('joi');

const register = Joi.object({
    name: Joi.string().trim().required(),
    username: Joi.string().trim().lowercase().required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).required(),
});

const login = Joi.object({
    username: Joi.string().trim().required(),
    password: Joi.string().required(),
});

const updateProfile = Joi.object({
    name: Joi.string().trim(),
    username: Joi.string().trim().lowercase(),
    email: Joi.string().email().lowercase(),
    birthday: Joi.date(),
    profile: Joi.string(),
}).min(1);

const changePassword = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
        .messages({ 'any.only': 'passwords do not match' }),
});

module.exports = { register, login, updateProfile, changePassword };
