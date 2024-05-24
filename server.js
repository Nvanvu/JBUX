require('express-async-errors');
require('module-alias/register');
require('dotenv').config();
require('_mongodb')();

const express = require('express');
const app = express();
const authRouter = require('./src/auth/auth.router');
const imgRouter = require('./src/upload/image.router');
const _port = process.env.port;
const callbackError = require('./src/common/callbackError');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/jb/api/au', authRouter);
app.use('/jb/api/up', imgRouter);

app.listen(_port || 8080, err => callbackError(err, _port));
app.use('*', (req, res) => {
    res.send({ message: '404 not found' });
})
app.use(function (err, req, res, next) {
    console.log(err);
    return res.status(err.status || 500).send({ success: 0, 'Error central message': err.message });
})