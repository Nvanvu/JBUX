require('dotenv').config();
const HTTPError = require('../common/httpError');
const nodemailer = require('nodemailer');
const config = process.env;

const sendEmail = async(email, subject, html) => {
    const transporter = nodemailer.createTransport({
        host: config.mail_server,
        port: config.mail_port,
        secure: true,
        auth: {
            user: config.mail_username,
            pass: config.mail_password
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    const options = {
        from: `"noreply" ${config.sender_address}`,
        to: email,
        subject: subject,
        html: html
    }
    return await transporter.sendMail(options, err => {
        if (err) {
            throw new HTTPError(400, err);
        }
        console.log('Send email successful.');
    });
}

module.exports = { sendEmail }