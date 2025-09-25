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
    const transport = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: 'nerdybuddy',
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
        message: 'Email sent successfully',
      });
      return { status: 200, response };
    } catch (error: any) {
      logger.log({
        level: 'error',
        message: `Error sending email: ${error.message}`,
      });
      return { status: 400, message: error.message };
    }
  }
}
