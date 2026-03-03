const nodemailer = require('nodemailer');
const fs = require('fs');

async function setupEthereal() {
    try {
        console.log('Generating Ethereal test account...');
        let testAccount = await nodemailer.createTestAccount();

        const envContent = `EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=${testAccount.user}
EMAIL_PASS=${testAccount.pass}
`;

        fs.writeFileSync('.env', envContent);
        console.log('✅ Ethereal account generated and saved to .env');
        console.log('User:', testAccount.user);
        console.log('Pass:', testAccount.pass);
        console.log('\nYou can view emails at: https://ethereal.email/messages');
    } catch (err) {
        console.error('Failed to generate Ethereal account:', err);
    }
}

setupEthereal();
