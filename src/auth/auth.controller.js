const HTTPError = require('../common/httpError');
const UserModel = require('../user/user');
const RegisterModel = require('../user/register');
const ImageModel = require('../upload/image');
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
        return res.send({ success: false, message: 'Token failed.' });
    }
    const _check_email = await RegisterModel.findOne({ email });
    if (!_check_email) {
        return res.send({ success: false, message: 'Token failed.' });
    }
    if (_check_email.accessAt) {
        return res.send({ success: false, message: 'Token failed.' });
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
    const User = await UserModel.findOne({ $and: [{ username }, { _hidden: false }] });
    if (!User) {
        return res.send({ success: false, message: 'Login fail.' });
    }
    const Pass = await bcrypt.compare(password, User.password);
    if (!Pass) {
        return res.send({ success: false, message: 'Login fail.' });
    }
    if (!['ON'].includes(User._status)) {
        return res.send({ success: false, message: `This account doesn't exist.` });
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
            _id: User._id,
            token_
        }
    });
}

const _getUserById = async (req, res) => {
    const { _id } = req.params;
    const User = await UserModel.findById(_id, {
        username: 1,
        role: 1,
        admin: 1,
        accessAt: 1,
        createdBy: 1,
        _status: 1,
        _hidden: 1
    })
        .populate('createdBy', 'email -_id');
    if (!User) {
        return res.send({ status: 404, success: false, message: 'No data found.' });
    }
    const _Data = await ImageModel.find({ createdBy: User._id }).
        populate({
            path: 'createdBy',
            select: ' username role admin accessAt createdBy _status _hidden -_id',
            populate: { path: 'createdBy', select: 'email -_id' }
        });
    if (_Data.length != 0) {
        return res.send({
            success: true,
            data: _Data
        })
    }
    res.send({
        success: true,
        data: User
    });
}
const getUsers = async (req, res) => {
    const { accessAt, _status, role, admin, keyword, offset, sort, limit } = req.query;
    const offsetNumber = offset && Number(offset) ? Number(offset) : 0;
    const limitNumber = limit && Number(limit) ? Number(limit) : 4;
    let filter = {};
    let sortCond = {};

    if (sort) {
        const [sortField, sortDirection] = sort.split('_');
        if (sortField && sortDirection) {
            sortCond[sortField] = sortDirection === 'desc' ? -1 : 1;
        }
    }

    if (accessAt) {
        filter.accessAt = accessAt;
    }
    if (role) {
        filter.role = role;
    }
    if (_status) {
        filter._status = _status;
    }
    if (admin) {
        filter.admin = admin;
    }

    if (keyword) {
        const regex = new RegExp(`${keyword}`, 'i');
        const regexCond = { $regex: regex };
        filter[`$or`] = [
            { username: regexCond },
            { email: regexCond }
        ]
    }
    const [User, totalUser] = await Promise.all([
        UserModel.find(filter, {
            username: 1,
            role: 1,
            admin: 1,
            accessAt: 1,
            createdBy: 1,
            _status: 1,
            _hidden: 1,
            _image: 1
        }).populate('createdBy', 'email -_id')
            .skip(offsetNumber)
            .limit(limitNumber)
            .sort(sortCond),
        UserModel.countDocuments(filter)]);
    if (totalUser === 0) {
        return res.send({ success: false, message: 'No data found.' });
    }
    const _Filter = User.filter(_h => {
        if (_h._hidden === false) {
            return _h;
        }
    });
    res.send({ success: true, data: { _Filter, _totalFilter: _Filter.length } });
}

const _update_password = async (req, res) => {
    const { _id } = req.params;
    const { password, confirm_password } = req.body;
    const User_ = await UserModel.findById({ _id });
    if (!User_) {
        return res.send({ success: false, message: 'No data found.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(password, salt);
    const hash_confirm_password = await bcrypt.hash(confirm_password, salt);

    await UserModel.findByIdAndUpdate(_id, {
        password: hash_password,
        confirm_password: hash_confirm_password,
        accessAt: new Date()
    }, { new: true });
    res.send({ success: true, message: 'Update successful.' });
}
const _update_username = async (req, res) => {
    const { _id } = req.params;
    const data_ = req.body;
    const User = await UserModel.findById(_id);
    if (!User) {
        return res.send({ success: false, message: 'No data found.' });
    }
    await UserModel.findByIdAndUpdate(_id, data_, { new: true });
    res.send({ success: true, message: 'update successful.' });
}
const _update_status = async (req, res) => {
    const { _id } = req.params;
    const data_ = req.body;
    const User = await UserModel.findById({ _id });
    if (!User) {
        return res.send({ success: false, message: 'No data found.' });
    }
    await UserModel.findByIdAndUpdate({ _id }, data_, { new: true });
    res.send({ success: true, message: 'update successful.' });
}

const _update_role = async (req, res) => {
    const { _id } = req.params;
    const data_ = req.body;
    const User = await UserModel.findById({ _id });
    if (!User) {
        return res.send({ success: false, message: 'No data found.' });
    }
    await UserModel.findByIdAndUpdate(_id, data_, { new: true });
    res.send({ success: true, message: 'update successful.' });
}
const _update_admin = async (req, res) => {
    const { _id } = req.params;
    const data_ = req.body;
    const User = await UserModel.findById({ _id });
    if (!User) {
        return res.send({ success: false, message: 'No data found.' });
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
    const User = await UserModel.findById(_id);
    if (!User) {
        return res.send({ success: false, message: 'No data found.' });
    }
    await UserModel.findByIdAndUpdate(_id, { data_ }, { new: true });
    res.send({ success: true, message: 'Update successful.' });
}
const _update_image = async (req, res) => {
    const { _image } = req.body;
    const { _id } = req.params;
    const User = await UserModel.findById(_id);
    if (!User) {
        return res.send({ success: false, message: 'No data found.' });
    }
    const _Image = await UserModel.findByIdAndUpdate(_id, { _image }, { new: true });
    res.send({ success: true, message: 'Update successful.', data: _Image });
}
module.exports = {
    register,
    _access,
    login,
    _getUserById,
    getUsers,
    _update_password,
    _update_status,
    _update_username,
    _update_role,
    _update_admin,
    _update_data,
    _update_image
}