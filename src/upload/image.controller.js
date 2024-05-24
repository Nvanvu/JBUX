const HTTPError = require('../common/httpError');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const ImageModel = require('./image');
const env_ = process.env;

cloudinary.config({
    cloud_name: env_.cloud_name,
    api_key: env_.cloud_api_key,
    api_secret: env_.cloud_api_secret,
    secure: true
});

const ImageUploadToCloud = async (req, res) => {
    const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    const result = await streamUpload(req);

    res.send({ success: true, data: result.secure_url });
};
const ImageUploadToDatabase = async (req, res) => {
    const { url, title } = req.body;
    const User_ = req.user;
    const newUrl = await ImageModel.create({
        title,
        url,
        createdBy: User_._id
    })
    res.send({
        message: 'Upload image successful.',
        data: newUrl
    })
};

module.exports = { ImageUploadToCloud, ImageUploadToDatabase }