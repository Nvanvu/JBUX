const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    confirm_password: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['user_', 'staff_', 'leader_'],
        default: 'user_'
    },
    admin: {
        type: Boolean,
        default: false
    },
    accessAt: {
        type: Date,
        default: null
    },
    _image: {
        type: String
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'register'
    },
    _status: {
        type: String,
        enum: ['ON', 'OFF'],
        default: 'ON'
    },
    _hidden: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
const UserModel = mongoose.model('user', UserSchema);
module.exports = UserModel;