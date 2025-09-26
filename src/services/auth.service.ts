import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { User } from '../entity/User';
import * as bcrypt from 'bcrypt';
import { jsonWeb } from '../utils/jwt';
import { AppDataSource } from '../config/database';
import { generateCode } from '../utils/generatorID';
import { LessThan, MoreThan } from 'typeorm';
import { EmailVerificationService } from '../utils/nodemailer';
import { Tenant } from '../entity/Tenant';
import { v4 as uuidv4 } from 'uuid';
import {
  resetPasswordEmailTemplate,
  resetPasswordKeyEmailTemplate,
} from '../helper/mailTemplate';
export class AuthService {
  private static userRepo = AppDataSource.getRepository(User);
  private static tenantRepo = AppDataSource.getRepository(Tenant);

  static async login(req: Request): Promise<apiResponse> {
    try {
      const { email, password } = req.body;
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
        relations: ['tenantId'],
      });
      if (!existingUser || !email) {
        return { status: 404, message: 'User not found!' };
      }
      if (existingUser?.isDeleted) {
        return { status: 404, message: 'This user has been removed!' };
      }
      if (existingUser?.isActive === false) {
        return { status: 400, message: 'This user has been deactivated' };
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

        return { status: 200, data: { ...result, token } };
      }
      return { status: 400, message: 'Incorrect password or login' };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async register(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      const { email, password, name, roleName } = req.body;
      if (!email || !password) {
        return { status: 400, message: 'Email and password are required!' };
      }

      const existingUser = await this.userRepo.findOneBy({ email, tenantId });
      if (existingUser) {
        return { status: 400, message: 'User already exists!' };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User();
      newUser.email = email;
      newUser.password = hashedPassword;
      newUser.name = name;
      newUser.isActive = false;
      newUser.roleName = roleName;
      newUser.tenantId = tenantId;
      const user = await this.userRepo.save(newUser);
      return {
        status: 200,
        message: 'User registered successfully!',
        data: user,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async forgetPassword(req: Request): Promise<apiResponse> {
    try {
      const { email } = req.body;

      if (!email) {
        return { status: 400, message: 'Email is required!' };
      }

      const user = await this.userRepo.findOne({
        where: { email, isDeleted: false, isActive: true },
      });

      if (!user) {
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

      return {
        status: 200,
        message: 'Please check your Email!',
      };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  static async forgetKeyPassword(req: Request): Promise<apiResponse> {
    try {
      const { email } = req.body;

      if (!email) {
        return { status: 400, message: 'Email is required!' };
      }

      const user = await this.userRepo.findOne({
        where: { email, isDeleted: false, isActive: true },
      });

      if (!user) {
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

      return {
        status: 200,
        message: 'Please check your Email!',
      };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  static async passwordReset(req: Request): Promise<apiResponse> {
    try {
      const { uniqueID, password, confirmPassword } = req.body;

      const user = await this.userRepo.findOne({
        where: {
          uniqueID,
          resetTokenExpiration: MoreThan(new Date()),
          isDeleted: false,
        },
      });

      if (!user) {
        return { status: 400, message: 'Invalid OTP' };
      }

      if (password !== confirmPassword) {
        return { status: 400, message: 'Passwords do not match!' };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;
      user.uniqueID = '';
      user.isFirstLogin = false;
      user.isActive = true;

      await this.userRepo.save(user);

      return { status: 200, message: 'Password updated successfully!' };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  static async passwordResetByEmail(req: Request): Promise<apiResponse> {
    try {
      const { email, password, confirmPassword } = req.body;

      const user = await this.userRepo.findOne({
        where: {
          email,
          isDeleted: false,
        },
      });

      if (!user) {
        return { status: 400, message: 'This user does not exist!' };
      }

      if (password !== confirmPassword) {
        return { status: 400, message: 'Passwords do not match!' };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;
      user.uniqueID = '';
      user.isFirstLogin = false;
      user.isActive = true;

      await this.userRepo.save(user);

      return { status: 200, message: 'Password updated successfully!' };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  static async passwordResetByToken(req: Request | any): Promise<apiResponse> {
    try {
      const { oldPassword, password, confirmPassword } = req.body;
      const { id } = req.user;

      if (!oldPassword || !password || !confirmPassword) {
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
        return { status: 400, message: 'This user does not exist!' };
      }
      if (oldPassword && !(await bcrypt.compare(oldPassword, user.password))) {
        return { status: 400, message: 'Old password is incorrect!' };
      }
      if (password !== confirmPassword) {
        return { status: 400, message: 'Passwords do not match!' };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;
      user.uniqueID = '';
      user.isFirstLogin = false;
      user.isActive = true;

      await this.userRepo.save(user);

      return { status: 200, message: 'Password updated successfully!' };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  static async verifyCode(req: Request): Promise<apiResponse> {
    try {
      const secret = process.env.JWT_SECRET;
      const { uniqueID } = req.body;

      const user = await this.userRepo.findOne({
        where: {
          uniqueID,
          resetTokenExpiration: LessThan(new Date()),
        },
      });

      if (user) {
        await this.userRepo.save(user);
        const token = await jsonWeb(user, secret as string);
        return { status: 200, data: { ...user, token } };
      } else {
        return { status: 400, message: 'Invalid OTP or expired reset token!' };
      }
    } catch (error: any) {
      return { status: 400, message: error.message };
    }
  }

  static async genTenantId(): Promise<apiResponse> {
    try {
      const newCompany = await this.tenantRepo.create({
        tenantId: uuidv4(),
      });

      await this.tenantRepo.save(newCompany);
      return { status: 200, data: newCompany };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }
}
