const { required } = require('joi');
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
    createdBy: {
        type: mongoose.Types.ObjectId
    },
    _status: {
        type: String,
        enum: ['ON', 'OFF'],
        default: 'ON'
    }
}, {
    timestamps: true
});
const UserModel = mongoose.model('user', UserSchema);
module.exports = UserModel;