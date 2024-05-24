const mongoose = require('mongoose');
const ImageSchema = new mongoose.Schema({
    url: {
        type: String
    },
    title: {
        type: String
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    }
}, {
    timestamps: true
})

const ImageModel = mongoose.model('image', ImageSchema);
module.exports = ImageModel;