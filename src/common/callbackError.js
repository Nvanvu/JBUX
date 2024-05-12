const callbackError = (err, _port) => {
    if (err) {
        return console.log(err);
    }
    console.log('Server started on port ', _port);
}
module.exports = callbackError;