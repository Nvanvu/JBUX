require('dotenv').config();
const url_ = process.env.mongodb;
const mongodb = require('mongoose');

const connectDB = async () => {
    try {
        await mongodb.connect(url_);
        console.log('Connect to mongodb successful');
    } catch (error) {
        return console.log(error);
    }
}
module.exports =  connectDB ;
