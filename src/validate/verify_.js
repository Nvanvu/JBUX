const HTTPError = require('../common/httpError');
const jwt = require('jsonwebtoken');
const UserModel = require('../user/user');

async function _Token(req, res, next) {
    const token_ = req.headers.token_;
    if (!token_) {
        return res.send({ success: true, message: 'token_ fail.' });
    }
    const jwtToken = token_.split(' ')[1];
    const data = jwt.verify(jwtToken, process.env.jwt_secretKey);
    const { _id } = data;
    if (!_id) {
        return res.send({ success: true, message: 'token_ fail.' });
    }
    const User_ = await UserModel.findById(_id);
    if (!User_) {
        return res.send({ success: true, message: 'token_ fail.' });
    }
    req.user = User_;
    next();
}


async function _Role(req, res, next) {
    if (['user_', 'staff_', 'leader_'].includes(req.user.role)) {
        if(req.user._id.toString()!=req.params._id){
            _Admin();
        }
        next();
    }
    return res.send({ success: true, message: 'Insufficient access.' });
};


async function _Staff(req, res, next) {
    if (!['staff_', 'leader_'].includes(req.user.role)) {
        return res.send({ success: true, message: 'Insufficient access.' });
    }
    next();
};
async function _Leader(req, res, next) {
    if (!['leader_'].includes(req.user.role)) {
        return res.send({ success: true, message: 'Insufficient access.' });
    }
    next();
};

async function _Admin(req, res, next) {
    if (!req.user.admin) {
        return res.send({ success: true, message: 'Insufficient access.' });
    }
    next();
};
async function _Status(req, res, next) {
    if (!['ON'].includes(req.user._status)) {
        return res.send({ success: true, message: `account doesn't exist.` });
    }
    next();
};

module.exports = {
    _Token,
    _Role,
    _Staff,
    _Leader,
    _Admin,
    _Status
};