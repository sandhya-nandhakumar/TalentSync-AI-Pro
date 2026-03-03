const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    auth: {
        user: process.env.EMAIL_USER || 'your-email@example.com',
        pass: process.env.EMAIL_PASS || 'your-password'
    }
});

exports.sendConfirmationEmail = async (candidateEmail, candidateName, jobTitle, applicationId) => {
    const mailOptions = {
        from: '"TalentSync AI" <noreply@talentsync.ai>',
        to: candidateEmail,
        subject: `Application Received: ${jobTitle}`,
        html: `
      <div style="background-color: #0f172a; color: #f8fafc; padding: 40px; font-family: sans-serif; border-radius: 12px;">
        <h1 style="color: #3b82f6;">TalentSync AI</h1>
        <p>Hi ${candidateName},</p>
        <p>Thank you for applying for the <strong>${jobTitle}</strong> position.</p>
        <p>Your application ID is: <strong>${applicationId}</strong></p>
        <p>Our team will review your profile and get back to you soon.</p>
        <hr style="border-color: #1e293b;" />
        <p style="font-size: 12px; color: #94a3b8;">&copy; 2024 TalentSync AI. All rights reserved.</p>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent to', candidateEmail);
    } catch (error) {
        console.error('Error sending email', error);
        throw error;
    }
};

exports.sendAdminNotification = async (jobTitle, candidateName, matchScore) => {
    // Similar implementation for HR/Admin
    console.log(`Notification: New applicant ${candidateName} for ${jobTitle} with score ${matchScore}`);
};

exports.sendStatusUpdateEmail = async (candidateEmail, candidateName, jobTitle, status) => {
    const statusColors = {
        shortlisted: '#10b981',
        rejected: '#ef4444',
        pending: '#f59e0b'
    };

    const mailOptions = {
        from: '"TalentSync AI" <noreply@talentsync.ai>',
        to: candidateEmail,
        subject: `Update on your application for ${jobTitle}`,
        html: `
      <div style="background-color: #0f172a; color: #f8fafc; padding: 40px; font-family: sans-serif; border-radius: 12px;">
        <h1 style="color: #3b82f6;">TalentSync AI</h1>
        <p>Hi ${candidateName},</p>
        <p>There has been an update to your application for the <strong>${jobTitle}</strong> position.</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #1e293b; border-left: 4px solid ${statusColors[status] || '#3b82f6'}; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Current Status</p>
            <p style="margin: 5px 0 0; font-size: 18px; color: ${statusColors[status] || '#f8fafc'}; text-transform: capitalize; font-weight: bold;">${status}</p>
        </div>
        <p>Our team will reach out to you if any further steps are required.</p>
        <hr style="border-color: #1e293b;" />
        <p style="font-size: 12px; color: #94a3b8;">&copy; 2024 TalentSync AI. All rights reserved.</p>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Status update email (${status}) sent to`, candidateEmail);
    } catch (error) {
        console.error('Error sending status update email', error);
        throw error;
    }
};

exports.sendInterviewInvitation = async (candidateEmail, candidateName, jobTitle, interviewDate, meetingLink) => {
    const mailOptions = {
        from: '"TalentSync AI" <noreply@talentsync.ai>',
        to: candidateEmail,
        subject: `Interview Invitation: ${jobTitle}`,
        html: `
      <div style="background-color: #05070a; color: #f8fafc; padding: 40px; font-family: sans-serif; border-radius: 24px; border: 1px solid #1e293b; max-width: 600px; margin: auto;">
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 50px; height: 50px; background-color: #4f46e5; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">TS</div>
            <h1 style="color: #ffffff; margin-top: 15px; font-size: 24px; font-weight: 900; letter-spacing: -0.025em; text-transform: uppercase;">Interview Scheduled</h1>
        </div>
        
        <p style="font-size: 16px; line-height: 24px;">Hi <strong>${candidateName}</strong>,</p>
        <p style="font-size: 16px; line-height: 24px; color: #94a3b8;">Great news! Your application for <strong>${jobTitle}</strong> has reached the interview stage. We're excited to learn more about you.</p>
        
        <div style="background-color: #0f172a; padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #1e293b;">
            <div style="margin-bottom: 20px;">
                <p style="margin: 0; font-size: 11px; color: #6366f1; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;">Scheduled Time</p>
                <p style="margin: 5px 0 0; font-size: 18px; color: #ffffff; font-weight: 700;">${new Date(interviewDate).toLocaleString()}</p>
            </div>
            
            <a href="${meetingLink}" style="display: block; width: 100%; padding: 16px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 12px; text-align: center; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);">Join Video Call</a>
            <p style="margin: 15px 0 0; font-size: 12px; color: #64748b; text-align: center;">You can join from your browser - no downloads required.</p>
        </div>
        
        <p style="font-size: 14px; line-height: 20px; color: #94a3b8;">Please ensure you have a stable internet connection and a working camera/microphone before the call starts.</p>
        
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 40px 0;" />
        <p style="font-size: 12px; color: #475569; text-align: center;">&copy; 2024 TalentSync AI. Sent via Secure Recruitment Portal.</p>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Interview invitation sent to', candidateEmail);
    } catch (error) {
        console.error('Error sending interview invitation', error);
        throw error;
    }
};
