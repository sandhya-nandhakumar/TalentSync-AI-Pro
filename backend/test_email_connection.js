require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    auth: {
        user: process.env.EMAIL_USER || 'your-email@example.com',
        pass: process.env.EMAIL_PASS || 'your-password'
    }
});

console.log('Testing SMTP connection with settings:');
console.log('Host:', process.env.EMAIL_HOST || 'smtp.ethereal.email');
console.log('Port:', process.env.EMAIL_PORT || 587);
console.log('User:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');

transporter.verify(function (error, success) {
    if (error) {
        console.log('❌ Connection Error:', error);
    } else {
        console.log('✅ SMTP Server is ready to take our messages');
    }
    process.exit();
});
