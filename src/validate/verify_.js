const HTTPError = require('../common/httpError');
const jwt = require('jsonwebtoken');
const UserModel = require('../user/user');

async function _Token_update_password(req, res, next) {
    const token_ = req.headers.token_;
    if (!token_) {
        return res.send({ success: true, message: 'token_ fail.' });
    }
    const jwtToken = token_.split(' ')[1];
    const data = jwt.verify(jwtToken, process.env.jwt_secretKey);
    const { _id } = data;
    if (!_id) {
        return res.send({ success: false, message: 'token_ fail.' });
    }
    const User_ = await UserModel.findById(_id);
    if (!User_) {
        return res.send({ success: false, message: 'token_ fail.' });
    }
    req.user = User_;
    next();
}
async function _Token(req, res, next) {
    const token_ = req.headers.token_;
    if (!token_) {
        return res.send({ success: true, message: 'token_ fail.' });
    }
    const jwtToken = token_.split(' ')[1];
    const data = jwt.verify(jwtToken, process.env.jwt_secretKey);
    const { _id } = data;
    if (!_id) {
        return res.send({ success: false, message: 'token_ fail.' });
    }
    const User_ = await UserModel.findById(_id);
    if (!User_) {
        return res.send({ success: false, message: 'token_ fail.' });
    }
    if (User_.confirm_password === null) {
        return res.send({ success: false, message: 'You need to update your password' })
    }
    req.user = User_;
    next();
}


async function _Role(req, res, next) {
    if (!['user_', 'staff_', 'leader_'].includes(req.user.role)) {
        return res.send({ success: false, message: 'Insufficient access.' });
    }
    next();

};
async function _Id_(req, res, next) {
    if (req.user._id.toString() != req.params._id) {
        return res.send({ success: false, message: 'Insufficient access.' });
    }
    next();
}

async function _Staff(req, res, next) {
    if (!['staff_', 'leader_'].includes(req.user.role)) {
        return res.send({ success: false, message: 'Insufficient access.' });
    }
    next();
};
async function _Leader(req, res, next) {
    if (!['leader_'].includes(req.user.role)) {
        return res.send({ success: false, message: 'Insufficient access.' });
    }
    next();
};

async function _Admin(req, res, next) {
    if (req.user._id.toString() != req.params._id) {
        if (!req.user.admin) {
            return res.send({ success: false, message: 'Insufficient access.' });
        }
    }
    next();
};
async function _Status(req, res, next) {
    if (!['ON'].includes(req.user._status)) {
        return res.send({ success: false, message: `Account doesn't exist.` });
    }
    next();
};
async function _getUsers(req, res, next) {
    if (!['staff_', 'leader_'].includes(req.user.role)) {
        return res.send({ success: false, message: 'Insufficient access.' });
    }
    next();
}
async function _getUser(req, res, next) {
    if (req.user._id.toString() != req.params._id) {
        if (!['staff_', 'leader_'].includes(req.user.role)) {
            return res.send({ success: false, message: 'Insufficient access.' });
        }
    }

    next();
}
module.exports = {
    _Token_update_password,
    _Token,
    _Role,
    _Staff,
    _Leader,
    _Admin,
    _Status,
    _Id_,
    _getUsers,
    _getUser
};