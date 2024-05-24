const HTTPError = require('../common/httpError');
const router = require('express').Router();
const multer = require('multer');
const imageController = require('./image.controller');
const verify_ = require('../validate/verify_');
const _schemas = require('../validate/_schemas');

const memoryStorage = multer.memoryStorage();
const uploadWithMemoryStorage = multer({ storage: memoryStorage });

router.post('/img/cl',
    uploadWithMemoryStorage.single('file'),
    imageController.ImageUploadToCloud
);

router.post('/img/db', verify_._Token, verify_._Role, imageController.ImageUploadToDatabase);

module.exports = router;