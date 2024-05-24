const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Types.ObjectId
    },
    dob: {
        type: String
    },
    gender: {
        type: String,
        enum: ['MAN', 'WOMAN', 'OTHER']
    },
    languages: {
        type: String
    },
    certifications: {
        type: String
    },
    summary: {
        type: String
    },
    workExperience: {
        type: String
    },
    skill: {
        type: String
    },
    job: {
        type: String
    },
    hidden: {
        type: Boolean
    },
    delete_: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const PostModel = mongoose.model('post', postSchema);
module.exports = PostModel;