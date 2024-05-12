const Joi = require('joi');

const _schemas = {
    register: Joi.object().keys({
        email: Joi.string().email({ tlds: { allow: false } }).required(),
        accessAt: Joi.date(),
    }),
    login: Joi.object().keys({
        username: Joi.string().required().min(6).max(32),
        password: Joi.string().required().min(4).max(32),
    }),
    _access: Joi.object().keys({
        _security: Joi.string().required().min(40).max(211)
    }),
    _Id: Joi.object().keys({
        _id: Joi.string().required().min(24).max(24)
    }),
    _set_password: Joi.object().keys({
        password: Joi.string().required().min(4).max(32).label('password'),
        confirm_password: Joi.any().equal(Joi.ref('password'))
            .required()
            .label('confirm_password')
            .options({ messages: { 'any.only': '{{#label}} does not match' } })
    }),
    _set_username: Joi.object().keys({
        username: Joi.string().required().min(5).max(32)
    }),
    _set_status: Joi.object().keys({
        _status: Joi.string().required().min(2).max(3)
    }),
    _set_role: Joi.object().keys({
        role: Joi.string().required().min(5).max(7)
    }),
    _set_admin: Joi.object().keys({
        admin: Joi.boolean().required()
    }),
    _set_data: Joi.object().keys({
        username: Joi.string().min(5).max(32),
        _status: Joi.string().min(2).max(3),
        role: Joi.string().min(5).max(7),
        admin: Joi.boolean()

    })
}
module.exports = _schemas;