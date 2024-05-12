const mongoose = require('mongoose');
const HistorySchema = new mongoose.Schema({
    time: {
        type: Date
    },
    count: {
        type: Number
    },
    createdBy: {
        type: mongoose.Types.ObjectId
    }
}, {
    timestamps: true
});
const HistoryModel = mongoose.model('history', HistorySchema);
module.exports = HistoryModel;