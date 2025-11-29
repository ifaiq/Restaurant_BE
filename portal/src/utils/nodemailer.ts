import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { logger } from './logger';
dotenv.config({ path: '../.env' });

interface Attachment {
  attachment?: Buffer | string;
  filename?: string;
}

export class EmailVerificationService {
  static async sendEmail(
    email: string,
    content: any,
    attachments: Attachment = {},
    subject: string,
  ): Promise<{ status: number; message?: string; response?: any }> {
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      const errorMsg =
        'Email configuration missing: EMAIL_USER or EMAIL_PASS not set in environment variables';
      logger.log({
        level: 'error',
        message: errorMsg,
      });
      return { status: 500, message: errorMsg };
    }

    const transport = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Add debug logging for troubleshooting
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    });

    // Verify connection before sending
    try {
      await transport.verify();
      logger.log({
        level: 'info',
        message: `SMTP connection verified for ${process.env.EMAIL_USER}`,
      });
    } catch (verifyError: any) {
      const errorMsg = `SMTP connection verification failed: ${verifyError.message}`;
      logger.log({
        level: 'error',
        message: errorMsg,
      });
      return { status: 500, message: errorMsg };
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Jaggha" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: content,
    };

    const { attachment, filename } = attachments;
    if (attachment && filename) {
      mailOptions.attachments = [{ filename, content: attachment }];
    }

    try {
      const response = await transport.sendMail(mailOptions);
      logger.log({
        level: 'info',
        message: `Email sent successfully to ${email}`,
      });
      return { status: 200, response };
    } catch (error: any) {
      const errorMsg = `Error sending email to ${email}: ${error.message}`;
      logger.log({
        level: 'error',
        message: errorMsg,
      });
      return { status: 400, message: errorMsg };
    }
  }
}
