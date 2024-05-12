const mongoose = require('mongoose');
const register = new mongoose.Schema({
    email: {
        type: String
    },
    accessAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
})
const RegisterModel = mongoose.model('register', register);
module.exports = RegisterModel;