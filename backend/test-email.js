require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function test() {
    console.log('Testing SMTP connection...');
    console.log('User:', process.env.EMAIL_USER);
    console.log('Host:', process.env.EMAIL_HOST);
    try {
        await transporter.verify();
        console.log('Success: SMTP Connection is verified.');

        const mailOptions = {
            from: '"TalentSync AI Test" <noreply@talentsync.ai>',
            to: process.env.EMAIL_USER, // Send to self
            subject: 'SMTP Test Message',
            text: 'This is a test message from TalentSync AI.'
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Success: Email sent!', info.messageId);
    } catch (error) {
        console.error('Error: SMTP connection or send failed:', error);
    }
}

test();
