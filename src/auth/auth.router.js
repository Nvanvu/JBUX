const router = require('express').Router();
const auth = require('./auth.controller');
const _schemas = require('../validate/_schemas');
const middleware = require('../validate/middleware');
const verify_ = require('../validate/verify_');

router.post('/cr', middleware(_schemas.register, 'body'), auth.register);
router.get('/verify', middleware(_schemas._access, 'query'), auth._access);
router.get('/log', middleware(_schemas.login, 'body'), auth.login);
router.get('/us', verify_._Token, verify_._Status, verify_._Staff, auth.getUsers);
router.get('/u/:_id', verify_._Token, verify_._Status, verify_._Role, middleware(_schemas._Id, 'params'), auth._user_getUserById);

router.post('/ud/new/pass/:_id',
    verify_._Token,
    verify_._Role,
    middleware(_schemas._Id, 'params'),
    middleware(_schemas._set_password, 'body'),
    auth._update_password);

router.post('/ud/st_/:_id',
    verify_._Token,
    verify_._Role,
    middleware(_schemas._Id, 'params'),
    middleware(_schemas._set_username, 'body'),
    auth._update_status);

router.post('/ud/ro_/:_id',
    verify_._Token,
    verify_._Leader,
    middleware(_schemas._Id, 'params'),
    middleware(_schemas._set_role, 'body'),
    auth._update_role);

router.post('/ub/dat_/by/ad/:_id',
    verify_._Token,
    verify_._Leader,
    verify_._Admin,
    middleware(_schemas._Id, 'params'),
    middleware(_schemas._set_data, 'body'),
    auth._update_data);

module.exports = router;