const HTTPError = require('../common/httpError');
const router = require('express').Router();
const multer = require('multer');
const imageController = require('./image.controller');

const memoryStorage = multer.memoryStorage();
const uploadWithMemoryStorage = multer({ storage: memoryStorage });

router.post('/img/cl',
    uploadWithMemoryStorage.single('file'),
    imageController.ImageUploadToCloud
);

router.post('/img/db',  imageController.ImageUploadToDatabase);

module.exports = router;