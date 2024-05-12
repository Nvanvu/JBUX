const HTTPError = require('../common/httpError');

const middleware = (schema, property) => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property]);
        const valid = error == null;
        if (valid) {
            next();
        } else {
            const { details } = error;
            const message = details.map(i => i.message).join(',');
            return res.send({ status: 422, success: true, message: message });
        }
    }
}
module.exports = middleware;
