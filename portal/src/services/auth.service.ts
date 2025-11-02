import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { RoleName, User } from '../entity/User';
import * as bcrypt from 'bcrypt';
import { jsonWeb } from '../utils/jwt';
import { AppDataSource } from '../config/database';
import { generateCode } from '../utils/generatorID';
import { LessThan, MoreThan } from 'typeorm';
import { EmailVerificationService } from '../utils/nodemailer';
import { Tenant } from '../entity/Tenant';
import {
  resetPasswordEmailTemplate,
  resetPasswordKeyEmailTemplate,
} from '../helper/mailTemplate';
import { logger } from '../utils/logger';
export class AuthService {
  private static userRepo = AppDataSource.getRepository(User);
  private static tenantRepo = AppDataSource.getRepository(Tenant);

  static async login(req: Request): Promise<apiResponse> {
    try {
      const { email, password } = req.body;
      logger.info(`Login attempt for email: ${email}`);

      // const roleName = (() => {
      //   switch (type?.toLowerCase()) {
      //     case 'user':
      //       return [RoleName.OWNER, RoleName.STAFF, RoleName.ADMIN];
      //     case 'admin':
      //       return [RoleName.STAFF, RoleName.ADMIN];
      //     case 'owner':
      //       return [RoleName.OWNER];
      //     default:
      //       return [RoleName.OWNER, RoleName.STAFF, RoleName.ADMIN];
      //   }
      // })();
      const existingUser = await this.userRepo.findOne({
        where: { email },
        relations: ['tenantId', 'restaurantId'],
      });
      if (!existingUser || !email) {
        logger.warn(`Login failed: User not found for email: ${email}`);
        return { status: 404, message: 'User not found!' };
      }
      if (existingUser?.isDeleted) {
        logger.warn(`Login failed: Deleted user attempted login: ${email}`);
        return { status: 404, message: 'This user has been removed!' };
      }
      if (existingUser?.isActive === false) {
        logger.warn(`Login failed: Deactivated user attempted login: ${email}`);
        return { status: 400, message: 'This user has been deactivated' };
      }
      if (
        !existingUser?.tenantId &&
        existingUser?.roleName !== RoleName.ADMIN &&
        existingUser?.isAdmin === false
      ) {
        logger.warn(
          `Login failed: Unauthorized user attempted login: ${email}`,
        );
        return { status: 400, message: 'You are not authorized to login' };
      }
      if (
        existingUser &&
        (await bcrypt.compare(password, existingUser.password))
      ) {
        existingUser.lastLogin = new Date();
        await this.userRepo.save(existingUser);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...result } = existingUser;
        const token = await jsonWeb(
          existingUser,
          process.env.JWT_SECRET as string,
        );

        logger.info(
          `Login successful for user: ${email}, ID: ${existingUser.id}`,
        );
        return { status: 200, data: { ...result, token } };
      }
      logger.warn(`Login failed: Incorrect password for email: ${email}`);
      return { status: 400, message: 'Incorrect password or login' };
    } catch (error: any) {
      logger.error(`Login error for email:  ${error.message}`, {
        stack: error.stack,
      });
      return { status: 500, error: error.message };
    }
  }

  static async register(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      const { email, password, name, roleName } = req.body;
      logger.info(
        `Registration attempt for email: ${email}, role: ${roleName}, tenantId: ${tenantId}`,
      );

      if (!email || !password) {
        logger.warn(`Registration failed: Missing email or password`);
        return { status: 400, message: 'Email and password are required!' };
      }

      const existingUser = await this.userRepo.findOneBy({ email, tenantId });
      if (existingUser) {
        logger.warn(
          `Registration failed: User already exists for email: ${email}`,
        );
        return { status: 400, message: 'User already exists!' };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User();
      newUser.email = email;
      newUser.password = hashedPassword;
      newUser.name = name;
      newUser.roleName = roleName;
      newUser.tenantId = tenantId;
      const user = await this.userRepo.save(newUser);
      logger.info(`User registered successfully: ${email}, ID: ${user.id}`);
      return {
        status: 200,
        message: 'User registered successfully!',
        data: user,
      };
    } catch (error: any) {
      logger.error(`Registration error for email: ${error.message}`, {
        stack: error.stack,
      });
      return { status: 500, error: error.message };
    }
  }

  static async forgetPassword(req: Request): Promise<apiResponse> {
    try {
      const { email } = req.body;
      logger.info(`Password reset request for email: ${email}`);

      if (!email) {
        logger.warn(`Password reset failed: Email is required`);
        return { status: 400, message: 'Email is required!' };
      }

      const user = await this.userRepo.findOne({
        where: { email, isDeleted: false, isActive: true },
      });

      if (!user) {
        logger.warn(
          `Password reset failed: User not found or removed for email: ${email}`,
        );
        return { status: 400, message: 'This user has been removed!' };
      }

      const uniqueID = await generateCode();
      const resetTokenExpiration = new Date(Date.now() + 160000);

      user.uniqueID = uniqueID;
      user.resetTokenExpiration = resetTokenExpiration;

      await this.userRepo.save(user);
      const uniqueIDField = resetPasswordEmailTemplate(uniqueID);

      await EmailVerificationService?.sendEmail(
        email,
        uniqueIDField,
        {},
        'Reset Password',
      );

      logger.info(`Password reset email sent to: ${email}`);
      return {
        status: 200,
        message: 'Please check your Email!',
      };
    } catch (error: any) {
      logger.error(`Password reset error for email: ${error.message}`, {
        stack: error.stack,
      });
      return { status: 500, message: error.message };
    }
  }

  static async forgetKeyPassword(req: Request): Promise<apiResponse> {
    try {
      const { email } = req.body;
      logger.info(`Password reset (with key) request for email: ${email}`);

      if (!email) {
        logger.warn(`Password reset (with key) failed: Email is required`);
        return { status: 400, message: 'Email is required!' };
      }

      const user = await this.userRepo.findOne({
        where: { email, isDeleted: false, isActive: true },
      });

      if (!user) {
        logger.warn(
          `Password reset (with key) failed: User not found or removed for email: ${email}`,
        );
        return { status: 400, message: 'This user has been removed!' };
      }

      const uniqueID = await generateCode();
      const resetTokenExpiration = new Date(Date.now() + 160000);

      user.uniqueID = uniqueID;
      user.resetTokenExpiration = resetTokenExpiration;
      const resetUrl = `${process.env.FRONTEND_RESET_URL}/auth/boxed-user-resetpassword?token=${uniqueID}`;

      await this.userRepo.save(user);
      const uniqueIDField = resetPasswordKeyEmailTemplate(resetUrl);

      await EmailVerificationService?.sendEmail(
        email,
        uniqueIDField,
        {},
        'Reset Password',
      );

      logger.info(`Password reset (with key) email sent to: ${email}`);
      return {
        status: 200,
        message: 'Please check your Email!',
      };
    } catch (error: any) {
      logger.error(
        `Password reset (with key) error for email:  ${error.message}`,
        { stack: error.stack },
      );
      return { status: 500, message: error.message };
    }
  }

  static async passwordReset(req: Request): Promise<apiResponse> {
    try {
      const { uniqueID, password, confirmPassword } = req.body;
      logger.info(`Password reset attempt with uniqueID: ${uniqueID}`);

      const user = await this.userRepo.findOne({
        where: {
          uniqueID,
          resetTokenExpiration: MoreThan(new Date()),
          isDeleted: false,
        },
      });

      if (!user) {
        logger.warn(
          `Password reset failed: Invalid or expired OTP for uniqueID: ${uniqueID}`,
        );
        return { status: 400, message: 'Invalid OTP' };
      }

      if (password !== confirmPassword) {
        logger.warn(
          `Password reset failed: Passwords do not match for user: ${user.email}`,
        );
        return { status: 400, message: 'Passwords do not match!' };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;
      user.uniqueID = '';
      user.isActive = true;

      await this.userRepo.save(user);

      logger.info(
        `Password reset successful for user: ${user.email}, ID: ${user.id}`,
      );
      return { status: 200, message: 'Password updated successfully!' };
    } catch (error: any) {
      logger.error(`Password reset error: ${error.message}`, {
        stack: error.stack,
      });
      return { status: 500, message: error.message };
    }
  }

  static async passwordResetByEmail(req: Request): Promise<apiResponse> {
    try {
      const { email, password, confirmPassword } = req.body;
      logger.info(`Password reset by email attempt for: ${email}`);

      const user = await this.userRepo.findOne({
        where: {
          email,
          isDeleted: false,
        },
      });

      if (!user) {
        logger.warn(
          `Password reset by email failed: User does not exist for email: ${email}`,
        );
        return { status: 400, message: 'This user does not exist!' };
      }

      if (password !== confirmPassword) {
        logger.warn(
          `Password reset by email failed: Passwords do not match for user: ${email}`,
        );
        return { status: 400, message: 'Passwords do not match!' };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;
      user.uniqueID = '';
      user.isActive = true;

      await this.userRepo.save(user);

      logger.info(
        `Password reset by email successful for user: ${email}, ID: ${user.id}`,
      );
      return { status: 200, message: 'Password updated successfully!' };
    } catch (error: any) {
      logger.error(`Password reset by email error for:  ${error.message}`, {
        stack: error.stack,
      });
      return { status: 500, message: error.message };
    }
  }

  static async passwordResetByToken(req: Request | any): Promise<apiResponse> {
    try {
      const { oldPassword, password, confirmPassword } = req.body;
      const { id } = req.user;
      logger.info(`Password reset by token attempt for user ID: ${id}`);

      if (!oldPassword || !password || !confirmPassword) {
        logger.warn(
          `Password reset by token failed: Missing required fields for user ID: ${id}`,
        );
        return { status: 400, message: 'All fields are required!' };
      }
      const user = await this.userRepo.findOne({
        where: {
          id,
          isDeleted: false,
          isActive: true,
        },
      });

      if (!user) {
        logger.warn(
          `Password reset by token failed: User does not exist for ID: ${id}`,
        );
        return { status: 400, message: 'This user does not exist!' };
      }
      if (oldPassword && !(await bcrypt.compare(oldPassword, user.password))) {
        logger.warn(
          `Password reset by token failed: Incorrect old password for user: ${user.email}`,
        );
        return { status: 400, message: 'Old password is incorrect!' };
      }
      if (password !== confirmPassword) {
        logger.warn(
          `Password reset by token failed: Passwords do not match for user: ${user.email}`,
        );
        return { status: 400, message: 'Passwords do not match!' };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;
      user.uniqueID = '';
      user.isActive = true;

      await this.userRepo.save(user);

      logger.info(
        `Password reset by token successful for user: ${user.email}, ID: ${id}`,
      );
      return { status: 200, message: 'Password updated successfully!' };
    } catch (error: any) {
      logger.error(
        `Password reset by token error for user ID:  ${error.message}`,
        { stack: error.stack },
      );
      return { status: 500, message: error.message };
    }
  }

  static async verifyCode(req: Request): Promise<apiResponse> {
    try {
      const secret = process.env.JWT_SECRET;
      const { uniqueID } = req.body;
      logger.info(`Code verification attempt for uniqueID: ${uniqueID}`);

      const user = await this.userRepo.findOne({
        where: {
          uniqueID,
          resetTokenExpiration: LessThan(new Date()),
        },
      });

      if (user) {
        await this.userRepo.save(user);
        const token = await jsonWeb(user, secret as string);
        logger.info(
          `Code verification successful for user: ${user.email}, ID: ${user.id}`,
        );
        return { status: 200, data: { ...user, token } };
      } else {
        logger.warn(
          `Code verification failed: Invalid or expired OTP for uniqueID: ${uniqueID}`,
        );
        return { status: 400, message: 'Invalid OTP or expired reset token!' };
      }
    } catch (error: any) {
      logger.error(`Code verification error: ${error.message}`, {
        stack: error.stack,
      });
      return { status: 400, message: error.message };
    }
  }

  static async genTenantId(): Promise<apiResponse> {
    try {
      logger.info(`Generating new tenant ID`);
      const newCompany = await this.tenantRepo.create({});

      await this.tenantRepo.save(newCompany);
      logger.info(`Tenant ID generated successfully: ${newCompany.id}`);
      return { status: 200, data: newCompany };
    } catch (error: any) {
      logger.error(`Tenant ID generation error: ${error.message}`, {
        stack: error.stack,
      });
      return { status: 500, message: error.message };
    }
  }
}
