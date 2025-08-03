import nodemailer from 'nodemailer';

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Function to send email
export const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// Email templates
export const emailTemplates = {
    welcome: (name) => ({
        subject: 'Welcome to Our Blog Platform',
        text: `Welcome ${name}! Thank you for joining our blog platform.`,
        html: `
            <h1>Welcome ${name}!</h1>
            <p>Thank you for joining our blog platform. We're excited to have you on board!</p>
            <p>Start exploring and sharing your thoughts with the community.</p>
        `
    }),
    passwordReset: (name, resetLink) => ({
        subject: 'Password Reset Request',
        text: `Hi ${name}, click the link to reset your password: ${resetLink}`,
        html: `
            <h1>Password Reset Request</h1>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to proceed:</p>
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
        `
    }),
    accountDeletion: {
        subject: 'Your Account Has Been Deleted',
        text: `Dear user,\n\nYour account has been deleted by the administrator. If you have any questions or concerns, please contact us.\n\nBest regards,\nThe Blog Team`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Account Deletion Notification</h2>
                <p>Dear user,</p>
                <p>We regret to inform you that your account has been deleted by the administrator.</p>
                <p>If you have any questions or concerns about this action, please don't hesitate to contact us.</p>
                <p>Best regards,<br>The Blog Team</p>
            </div>
        `
    }
}; 