const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    job_name: {
        type: String
    }
}, {
    timestamps: true
});

const JobModel = mongoose.model('job', JobSchema);
module.exports = JobModel;