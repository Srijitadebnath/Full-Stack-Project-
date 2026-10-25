import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Configure Email Transporter
// In production: Uses real Outlook/Microsoft 365 credentials from .env
// In local dev: If SMTP credentials are not set, it creates a test account that generates viewable web links!
const createTransporter = async () => {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.office365.com',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: false, // TLS
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Development fallback: Auto-generated test mailbox
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

// 2. Dispatch OC Activation Email
export const sendOcActivationEmail = async (
    studentEmail: string,
    studentName: string,
    officialOcEmail: string,
    activationUrl: string
) => {
    try {
        const transporter = await createTransporter();

        const info = await transporter.sendMail({
            from: '"UPES Event Operations" <events-noreply@upes.ac.in>',
            to: studentEmail,
            subject: '🎉 Congratulations! Your Official OC Account is Ready',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #4f46e5;">Welcome to the Organizing Committee!</h2>
                    <p>Dear <strong>${studentName}</strong>,</p>
                    <p>You have been officially recruited to the campus fest Organizing Committee (OC).</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">Your Official Institutional OC Handle:</p>
                        <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #111827;">${officialOcEmail}</p>
                    </div>
                    <p>To access the OC Portal, checklists, and task board, please activate your account and create a secure password:</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${activationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Activate OC Account & Set Password</a>
                    </p>
                    <p style="font-size: 12px; color: #9ca3af;">This link is confidential and intended solely for your enrolled student email (${studentEmail}).</p>
                </div>
            `,
        });

        console.log(`✉️ OC Activation email dispatched to: ${studentEmail}`);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`🔗 Click to view formatted email preview: ${previewUrl}`);
        }
        return { success: true, previewUrl };
    } catch (error) {
        console.error('Failed to send OC activation email:', error);
        return { success: false, error };
    }
};

// 3. Dispatch Password Recovery Email (Exclusively to .stu.upes.ac.in)
export const sendPasswordResetEmail = async (
    targetRecoveryEmail: string,
    userName: string,
    resetUrl: string
) => {
    try {
        const transporter = await createTransporter();

        const info = await transporter.sendMail({
            from: '"UPES Security & Accounts" <security@upes.ac.in>',
            to: targetRecoveryEmail,
            subject: '🔑 Password Reset Request - UPES Event Portal',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #dc2626;">Password Reset Request</h2>
                    <p>Dear <strong>${userName}</strong>,</p>
                    <p>We received a request to reset the password for your campus event portal account.</p>
                    <p>Click the button below to set a new password. For security, this link will <strong>expire in 15 minutes</strong>:</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset My Password</a>
                    </p>
                    <p style="font-size: 13px; color: #4b5563;">If you did not make this request, please ignore this email. Your password will remain unchanged.</p>
                    <p style="font-size: 12px; color: #9ca3af; margin-top: 25px;">Delivered securely to official student address: ${targetRecoveryEmail}</p>
                </div>
            `,
        });

        console.log(`✉️ Password reset email dispatched to: ${targetRecoveryEmail}`);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`🔗 Click to view formatted reset email preview: ${previewUrl}`);
        }
        return { success: true, previewUrl };
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        return { success: false, error };
    }
};