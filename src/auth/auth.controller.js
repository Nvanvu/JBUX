const HTTPError = require('../common/httpError');
const UserModel = require('../user/user');
const RegisterModel = require('../user/register');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mailer = require('../mailer/config');
const html = require('../mailer/html');
const { random_password } = require('../mailer/code');

const _env = process.env;

const register = async (req, res) => {
    const { email } = req.body;
    const _Email = await RegisterModel.findOne({ email });
    if (_Email) {
        return res.send({ success: true, message: 'Email existed.' });
    }
    const salt = await bcrypt.genSalt(10);
    const _username = email.split('@')[0];
    const hashed = await bcrypt.hash(email, salt);
    const _security = jwt.sign({ email, hashed }, _env.jwt_key, { expiresIn: _env.exp_reg })
    await RegisterModel.create({ email: email });
    mailer.sendEmail(email, 'Verify email', html.access_link_email(_env.appUrl, _security, _username));
    res.send({ success: 1, message: 'Access successful' });

}

const _access = async (req, res) => {
    const { _security } = req.query;
    const _get_data = jwt.verify(_security, _env.jwt_key, function (err, decoded) {
        if (err) {
            throw new HTTPError(err.message);
        }
        return decoded;
    });
    const { email, hashed } = _get_data;
    const _compare = await bcrypt.compare(email, hashed);
    if (!_compare) {
        return res.send({ success: true, message: 'Token failed.' });
    }
    const _check_email = await RegisterModel.findOne({ email });
    if (!_check_email) {
        return res.send({ success: true, message: 'Token failed.' });
    }
    if (_check_email.accessAt) {
        return res.send({ success: true, message: 'Token failed.' });
    }
    const temporary_password = random_password();
    const salt = await bcrypt.genSalt(10);
    const _hash_temp_pass = await bcrypt.hash(temporary_password, salt);

    const _username = email.split("@")[0];

    await RegisterModel.findByIdAndUpdate(
        _check_email._id, {
        accessAt: new Date()
    },
        { new: true }
    );
    await UserModel.create({
        createdBy: _check_email._id,
        password: _hash_temp_pass,
        username: _username
    });
    mailer.sendEmail(email, 'Verify email success', html.temporary_password(_env.appUrl, temporary_password, _username))

    res.send({ success: 1, message: 'Access successful' });
}

const login = async (req, res) => {
    const { username, password } = req.body;
    const User = await UserModel.findOne({ username });
    if (!User) {
        return res.send({ success: true, message: 'login fail.' });
    }
    const Pass = await bcrypt.compare(password, User.password);
    if (!Pass) {
        return res.send({ success: true, message: 'login fail.' });
    }
    if (!['ON'].includes(User._status)) {
        return res.send({ success: true, message: `This account doesn't exist.` });
    }
    const token_ = jwt.sign({
        _id: User._id,
        role: User.role,
        admin: User.admin
    },
        process.env.jwt_secretKey,
        {
            expiresIn: process.env.exp
        })
    res.send({
        success: true,
        message: 'Login successful',
        data: {
            token_
        }
    });
}

const _user_getUserById = async (req, res) => {
    const { _id, username } = req.params;
    let filter = {}
    if (_id) {
        filter._id = _id;
    }
    if (username) {
        filter.username = username;
    }
    const User = await UserModel.find(filter);
    if (!User) {
        return res.send({ success: true, message: 'No data found.' });
    }
    const clone = JSON.parse(JSON.stringify(User));
    res.send({
        success: true,
        data: { ...clone, password: '', confirm_password: '', temporary_password: '' }
    });
}
const getUsers = async (req, res) => {
    let filter = {};
    const { username, createdBy, _id, accessAt, _status, role, admin } = req.params;
    if (createdBy) {
        filter.createdBy = createdBy;
    }
    if (username) {
        filter.username = username;
    }
    if (_id) {
        filter._id = _id;
    }
    if (accessAt) {
        filter.accessAt = accessAt;
    }
    if (_status) {
        filter.role = role;
    }
    if (admin) {
        filter.admin = admin;
    }
    const User = await UserModel.find(filter);
    if (!User) {
        return res.send({ success: true, message: 'No data found.' });
    }
    res.send({ success: true, data: User });
}

const _update_password = async (req, res) => {
    const { _id } = req.params;
    const { password, confirm_password } = req.body;
    const User_ = await UserModel.findById({ _id });
    if (!User_) {
        return res.send({ success: true, message: 'No data found.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(password, salt);
    const hash_confirm_password = await bcrypt.hash(confirm_password, salt);

    await UserModel.findByIdAndUpdate(_id, {
        password: hash_password,
        confirm_password: hash_confirm_password,
        accessAt: new Date()
    }, { new: true });
    res.send({ success: true, message: 'update successful.' });
}
const _update_username = async (req, res) => {
    const { _id } = req.params;
    const data_ = req.body;
    const User = await UserModel.findById({ _id });
    if (!User) {
        return res.send({ success: true, message: 'No data found.' });
    }
    await UserModel.findByIdAndUpdate({ _id }, data_, { new: true });
    res.send({ success: true, message: 'update successful.' });
}
const _update_status = async (req, res) => {
    const { _id } = req.params;
    const data_ = req.body;
    const User = await UserModel.findById({ _id });
    if (!User) {
        return res.send({ success: true, message: 'No data found.' });
    }
    await UserModel.findByIdAndUpdate({ _id }, data_, { new: true });
    res.send({ success: true, message: 'update successful.' });
}

const _update_role = async (req, res) => {
    const { _id } = req.params;
    const data_ = req.body;
    const User = await UserModel.findById({ _id });
    if (!User) {
        return res.send({ success: true, message: 'No data found.' });
    }
    await UserModel.findByIdAndUpdate(_id, data_, { new: true });
    res.send({ success: true, message: 'update successful.' });
}
const _update_admin = async (req, res) => {
    const { _id } = req.params;
    const data_ = req.body;
    const User = await UserModel.findById({ _id });
    if (!User) {
        return res.send({ success: true, message: 'No data found.' });
    }
    await UserModel.findByIdAndUpdate(_id, data_, { new: true });
    res.send({ success: true, message: 'update successful.' });
}
const _reset_passwrod = async (req, res) => {
    const { email } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(email, salt);
    mailer.sendEmail(email, html.reset_password);
}//check

const _update_data = async (req, res) => {
    const data_ = req.body;
    const { _id } = req.params;
    const User = await UserModel.findById({ _id });
    if (!User) {
        return res.send({ success: true, message: 'No data found.' });
    }
    await UserModel.findByIdAndUpdate({ _id }, { data_ }, { new: true });
    res.send({ success: true, message: 'update successful.' });
}
module.exports = {
    register,
    _access,
    login,
    _user_getUserById,
    getUsers,
    _update_password,
    _update_status,
    _update_username,
    _update_role,
    _update_admin,
    _update_data
}