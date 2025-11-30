import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { RoleName, User } from '../entity/User';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { Between, ILike } from 'typeorm';
import { loginInfoEmailTemplate } from '../helper/mailTemplate';
import { MongoClient } from 'mongodb';
import { EmailQueueProducer } from '../queues/producer/emailQueue.producer';
import { logger } from '../utils/logger';

export class UserService {
  private static userRepo = AppDataSource.getRepository(User);
  private static emailQueueProducer = new EmailQueueProducer();

  /**
   * Helper function to parse database errors and return user-friendly messages
   */
  private static parseDatabaseError(error: any): {
    status: number;
    message: string;
  } {
    const errorMessage = error.message || '';
    const errorCode = error.code || '';

    // Handle unique constraint violations
    if (errorCode === '23505' || errorMessage.includes('duplicate key')) {
      if (errorMessage.includes('phone') || errorMessage.includes('UQ_')) {
        return {
          status: 409,
          message:
            'This phone number is already registered. Please use a different phone number.',
        };
      }
      if (errorMessage.includes('email')) {
        return {
          status: 409,
          message:
            'This email address is already registered. Please use a different email address.',
        };
      }
      return {
        status: 409,
        message:
          'A record with this information already exists. Please check your input and try again.',
      };
    }

    // Handle foreign key constraint violations
    if (errorCode === '23503' || errorMessage.includes('foreign key')) {
      return {
        status: 400,
        message: 'Invalid reference. One or more related records do not exist.',
      };
    }

    // Handle not null constraint violations
    if (errorCode === '23502' || errorMessage.includes('not null')) {
      return {
        status: 400,
        message:
          'Required fields are missing. Please check your input and try again.',
      };
    }

    // Generic database error
    return {
      status: 500,
      message:
        'An error occurred while processing your request. Please try again later.',
    };
  }
  static async createOwner(req: Request | any): Promise<apiResponse> {
    try {
      const { email, name, country, restaurantId, password, phone, address } =
        req.body;

      if (!restaurantId) {
        return { status: 400, message: 'Restaurant ID is required!' };
      }
      const restaurant = await AppDataSource.getRepository(
        'Restaurant',
      ).findOne({
        where: { id: restaurantId },
        relations: ['tenantId'],
      });

      if (!restaurant || !restaurant.tenantId || !restaurant.tenantId.id) {
        return { status: 400, message: 'Restaurant not found!' };
      }

      const tenantId = restaurant.tenantId?.id;

      const existingUser = await this.userRepo.findOneBy({
        email,
        tenantId: { id: tenantId },
      });
      if (existingUser) {
        return {
          status: 409,
          message:
            'A user with this email address already exists. Please use a different email.',
        };
      }

      // Check if phone number is already taken
      if (phone) {
        const existingUserWithPhone = await this.userRepo.findOne({
          where: { phone, isDeleted: false },
        });
        if (existingUserWithPhone) {
          return {
            status: 409,
            message:
              'This phone number is already registered. Please use a different phone number.',
          };
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User();
      newUser.email = email;
      newUser.password = hashedPassword;
      newUser.name = name;
      newUser.country = country;
      newUser.phone = phone;
      newUser.address = address;
      newUser.roleName = RoleName.OWNER;
      newUser.tenantId = tenantId;
      newUser.restaurantId = restaurantId;
      const user = await this.userRepo.save(newUser);
      if (!user) {
        return { status: 400, message: 'Unable to create owner' };
      }
      const passwordField = loginInfoEmailTemplate(password);
      await this.emailQueueProducer.addEmailJob(
        email,
        passwordField,
        {},
        'Login Details',
      );
      logger.info(`Owner created successfully!`, { user });
      return {
        status: 200,
        message: 'Owner created successfully!',
        data: user,
      };
    } catch (error: any) {
      logger.warn(`Owner creation error: ${error.message}`, {
        stack: error.stack,
      });
      const parsedError = this.parseDatabaseError(error);
      return { status: parsedError.status, message: parsedError.message };
    }
  }

  static async createStaff(req: Request | any): Promise<apiResponse> {
    try {
      const { email, name, password, country, phone, address } = req.body;
      const restaurantId = req.user.restaurantId?.id;
      const tenantId = req.user.tenantId?.id;

      const restaurant = await AppDataSource.getRepository(
        'Restaurant',
      ).findOne({
        where: { id: restaurantId, tenantId: { id: tenantId } },
        relations: ['tenantId'],
      });
      if (!restaurant || !restaurant.tenantId || !restaurant.tenantId.id) {
        return { status: 400, message: 'Restaurant not found!' };
      }

      const existingUser = await this.userRepo.findOneBy({
        email,
        tenantId: { id: tenantId },
      });
      if (existingUser) {
        return {
          status: 409,
          message:
            'A user with this email address already exists. Please use a different email.',
        };
      }

      // Check if phone number is already taken
      if (phone) {
        const existingUserWithPhone = await this.userRepo.findOne({
          where: { phone, isDeleted: false },
        });
        if (existingUserWithPhone) {
          return {
            status: 409,
            message:
              'This phone number is already registered. Please use a different phone number.',
          };
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User();
      newUser.email = email;
      newUser.password = hashedPassword;
      newUser.name = name;
      newUser.country = country;
      newUser.phone = phone;
      newUser.address = address;
      newUser.roleName = RoleName.STAFF;
      newUser.tenantId = tenantId;
      newUser.restaurantId = restaurantId;
      const user = await this.userRepo.save(newUser);
      if (!user) {
        return { status: 400, message: 'Unable to create user' };
      }
      const passwordField = loginInfoEmailTemplate(password);
      await this.emailQueueProducer.addEmailJob(
        email,
        passwordField,
        {},
        'Login Details',
      );
      logger.info(`Staff created successfully!`, { user });
      return {
        status: 200,
        message: 'Staff created successfully!',
        data: user,
      };
    } catch (error: any) {
      logger.warn(`Staff creation error: ${error.message}`, {
        stack: error.stack,
      });
      const parsedError = this.parseDatabaseError(error);
      return { status: parsedError.status, message: parsedError.message };
    }
  }

  static async getOwnerById(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const userData = await this.userRepo.findOne({
        where: {
          id: id,
          isDeleted: false,
          roleName: RoleName.OWNER,
        },
        relations: ['tenantId', 'restaurantId'],
      });
      if (!userData) {
        return { status: 400, message: 'Owner not found!' };
      }
      return { status: 200, data: userData };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getStaffById(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;
      const userData = await this.userRepo.findOne({
        where: {
          id: id,
          isDeleted: false,
          roleName: RoleName.STAFF,
          tenantId: {
            id: tenantId,
          },
        },
        relations: ['tenantId', 'restaurantId'],
      });
      if (!userData) {
        return { status: 400, message: 'Staff not found!' };
      }
      return { status: 200, data: userData };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }
  static async getUserProfile(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.user;
      const tenantId = req?.tenantId;
      const userData = await this.userRepo.findOne({
        where: {
          id: id,
          isDeleted: false,
          tenantId: {
            id: tenantId,
          },
        },
        relations: ['tenantId', 'restaurantId'],
      });
      if (!userData) {
        return { status: 400, message: 'User not found!' };
      }
      return { status: 200, data: userData };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async deleteUser(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;
      const userData = await this.userRepo.findOneBy({
        id: id,
        isDeleted: false,
        tenantId: {
          id: tenantId,
        },
      });
      if (!userData) {
        return { status: 400, message: 'User not found!' };
      }
      userData.isDeleted = true;
      userData.isActive = false;
      await this.userRepo.save(userData);
      logger.info(`User deleted successfully!`, { userData });
      return { status: 200, message: 'User deleted successfully!' };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async updateStaff(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;

      const { country, name, phone, address } = req.body;
      let userData = await this.userRepo.findOne({
        where: {
          id: id,
          tenantId: {
            id: tenantId,
          },
          isDeleted: false,
        },
      });
      if (!userData) {
        return { status: 400, message: 'Staff member not found!' };
      }

      // Check if phone number is being changed and if it's already taken
      if (phone && phone !== userData.phone) {
        const existingUserWithPhone = await this.userRepo.findOne({
          where: { phone, isDeleted: false },
        });
        if (existingUserWithPhone && existingUserWithPhone.id !== id) {
          return {
            status: 409,
            message:
              'This phone number is already registered. Please use a different phone number.',
          };
        }
      }

      userData.name = name ?? userData.name;
      userData.country = country ?? userData.country;
      userData.phone = phone ?? userData.phone;
      userData.address = address ?? userData.address;
      userData = await this.userRepo.save(userData);

      logger.info(`Staff member updated successfully: ${userData.email}`);
      return {
        status: 200,
        message: 'Staff member information updated successfully!',
        data: userData,
      };
    } catch (error: any) {
      logger.error(`Staff update error: ${error.message}`, {
        stack: error.stack,
      });
      const parsedError = this.parseDatabaseError(error);
      return { status: parsedError.status, message: parsedError.message };
    }
  }
  static async updateProfile(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.user;
      const tenantId = req?.tenantId;
      const { country, name, phone, address } = req.body;
      let userData = await this.userRepo.findOneBy({
        id: id,
        tenantId: { id: tenantId },
      });
      if (!userData) {
        return { status: 400, message: 'User not found!' };
      }

      // Check if phone number is being changed and if it's already taken
      if (phone && phone !== userData.phone) {
        const existingUserWithPhone = await this.userRepo.findOne({
          where: { phone, isDeleted: false },
        });
        if (existingUserWithPhone && existingUserWithPhone.id !== id) {
          return {
            status: 409,
            message:
              'This phone number is already registered. Please use a different phone number.',
          };
        }
      }

      userData.name = name ?? userData.name;
      userData.country = country ?? userData.country;
      userData.phone = phone ?? userData.phone;
      userData.address = address ?? userData.address;
      userData = await this.userRepo.save(userData);

      return {
        status: 200,
        message: 'Profile updated successfully!',
        data: userData,
      };
    } catch (error: any) {
      logger.error(`Profile update error: ${error.message}`, {
        stack: error.stack,
      });
      const parsedError = this.parseDatabaseError(error);
      return { status: parsedError.status, message: parsedError.message };
    }
  }
  static async updateOwner(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;

      const { country, name, email, restaurantId, phone, address } = req.body;
      let userData = await this.userRepo.findOne({
        where: {
          id: id,
          isDeleted: false,
        },
      });
      if (!userData) {
        return { status: 400, message: 'Owner not found!' };
      }

      // Check if email is being changed and if it's already taken
      if (email && email !== userData.email) {
        const existingUserWithEmail = await this.userRepo.findOne({
          where: { email, isDeleted: false },
        });
        if (existingUserWithEmail && existingUserWithEmail.id !== id) {
          return {
            status: 409,
            message:
              'This email address is already registered. Please use a different email address.',
          };
        }
      }

      // Check if phone number is being changed and if it's already taken
      if (phone && phone !== userData.phone) {
        const existingUserWithPhone = await this.userRepo.findOne({
          where: { phone, isDeleted: false },
        });
        if (existingUserWithPhone && existingUserWithPhone.id !== id) {
          return {
            status: 409,
            message:
              'This phone number is already registered. Please use a different phone number.',
          };
        }
      }

      userData.name = name ?? userData.name;
      userData.country = country ?? userData.country;
      userData.email = email ?? userData.email;
      userData.phone = phone ?? userData.phone;
      userData.address = address ?? userData.address;
      userData.restaurantId = restaurantId ?? userData.restaurantId;
      userData = await this.userRepo.save(userData);

      logger.info(`Owner updated successfully: ${userData.email}`);
      return {
        status: 200,
        message: 'Owner information updated successfully!',
        data: userData,
      };
    } catch (error: any) {
      logger.error(`Owner update error: ${error.message}`, {
        stack: error.stack,
      });
      const parsedError = this.parseDatabaseError(error);
      return { status: parsedError.status, message: parsedError.message };
    }
  }

  static async getAllUsers(req: Request | any): Promise<apiResponse> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search ? req.query.search.toString() : null;
      const status = req.query.status;

      const baseCondition: any = {
        isDeleted: false,
        roleName: RoleName.OWNER,
      };
      if (search) {
        baseCondition['name'] = ILike(`%${search}%`);
      }

      if (status) {
        switch (status.toLowerCase()) {
          case 'active':
            baseCondition['isActive'] = true;
            baseCondition['isFirstLogin'] = false;
            baseCondition['isDeleted'] = false;
            break;
          case 'pending':
            baseCondition['isActive'] = true;
            baseCondition['isFirstLogin'] = true;
            baseCondition['isDeleted'] = false;
            break;
          case 'deleted':
            baseCondition['isDeleted'] = true;
            break;
          case 'inactive':
            baseCondition['isActive'] = false;
            baseCondition['isDeleted'] = false;
            break;
          default:
            return { status: 400, message: 'Invalid status value!' };
        }
      }
      const [users, total] = await this.userRepo.findAndCount({
        where: baseCondition,
        take: limit,
        skip: (page - 1) * limit,
        relations: ['tenantId', 'restaurantId'],
        order: {
          createdAt: 'DESC',
        },
      });

      const totalPages = Math.ceil(total / limit);
      logger.info(`Users fetched successfully!`);
      return {
        status: 200,
        data: users,
        meta: {
          totalItems: total,
          totalPages,
          currentPage: page,
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getUserAnalytics(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;

      const baseCondition = {
        isDeleted: false,
        // roleName: In([RoleName.USER, RoleName.STAFF]),
        tenantId: { id: tenantId },
      };

      const totalUsers = await this.userRepo.count({ where: baseCondition });

      const activeUsers = await this.userRepo.count({
        where: { ...baseCondition, isActive: true },
      });

      const inactiveUsers = await this.userRepo.count({
        where: { ...baseCondition, isActive: false },
      });

      const pendingUsers = await this.userRepo.count({
        where: { ...baseCondition, isActive: true },
      });

      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const dailySignups: { date: string; count: number }[] = [];
      for (let day = 1; day <= endOfMonth.getDate(); day++) {
        const currentDate = new Date(now.getFullYear(), now.getMonth(), day);
        const nextDate = new Date(now.getFullYear(), now.getMonth(), day + 1);

        const dailyCount = await this.userRepo.count({
          where: {
            ...baseCondition,
            createdAt: Between(currentDate, nextDate),
          },
        });

        dailySignups.push({
          date: currentDate.toISOString().split('T')[0],
          count: dailyCount,
        });
      }

      const dailySignins: { date: string; count: number }[] = [];
      const activeUsersByHour: { hour: number; count: number }[] = Array(
        24,
      ).fill({ hour: 0, count: 0 });

      const users = await this.userRepo.find({
        where: { ...baseCondition },
        select: ['lastLogin'],
      });
      users.forEach((user) => {
        if (user.lastLogin) {
          const activityHour = new Date(user.lastLogin).getHours();
          activeUsersByHour[activityHour].count += 1;
          const loginDate = user.lastLogin.toISOString().split('T')[0];
          const existingSignin = dailySignins.find(
            (signin) => signin.date === loginDate,
          );

          if (existingSignin) {
            existingSignin.count += 1;
          } else {
            dailySignins.push({ date: loginDate, count: 1 });
          }
        }
      });

      dailySignins.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      return {
        status: 200,
        data: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          pendingUsers,
          dailySignups,
          dailySignins,
          activeUsersByHour,
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async userUsageAnalytics(req: Request | any): Promise<apiResponse> {
    try {
      const URI = process.env.MONGO_URI_LLM || '';
      const DB = process.env.DB_NAME || '';
      const client = new MongoClient(URI);
      const tenantId = req?.tenantId;
      await client.connect();
      const db = client.db(DB);
      const collection = db.collection('users');

      const users = await collection.find({ tenantId }).toArray();
      if (!users || users?.length === 0) {
        return { status: 200, data: [] };
      }
      const companyDepartmentUsage = users.reduce((acc: any, user) => {
        const { company, department, usage } = user;

        const key = `${company}-${department}`;

        if (!acc[key]) {
          acc[key] = { company, department, usage: 0 };
        }

        acc[key].usage += usage;

        return acc;
      }, {});

      const companyDepartmentUsageArray = Object.values(companyDepartmentUsage);
      const totalUsage = users.reduce((acc, user) => acc + user.usage, 0);
      return {
        status: 200,
        data: {
          users,
          companyDepartmentUsage: companyDepartmentUsageArray,
          totalUsage,
        },
      };
    } catch (error: any) {
      return {
        status: 500,
        error: error.message,
      };
    }
  }
  static async getAdminAnalytics(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;

      const baseCondition = {
        // isDeleted: false,
        tenantId: { id: tenantId },
        roleName: RoleName.STAFF,
      };

      const totalUsers = await this.userRepo.count({ where: baseCondition });

      const activeUsers = await this.userRepo.count({
        where: { ...baseCondition, isActive: true },
      });

      const inactiveUsers = await this.userRepo.count({
        where: { ...baseCondition, isActive: false },
      });

      const pendingUsers = await this.userRepo.count({
        where: { ...baseCondition, isActive: true },
      });

      return {
        status: 200,
        data: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          pendingUsers,
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }
  static async getAllStaff(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const [users, total] = await this.userRepo.findAndCount({
        where: {
          roleName: RoleName.STAFF,
          isDeleted: false,
          isActive: true,
          tenantId: {
            id: tenantId,
          },
        },
        take: limit,
        skip: (page - 1) * limit,
        relations: ['tenantId', 'restaurantId'],
        order: {
          updatedAt: 'DESC',
        },
      });

      const totalPages = Math.ceil(total / limit);
      logger.info(`Staff fetched successfully!`);

      return {
        status: 200,
        data: users,
        meta: {
          totalItems: total,
          totalPages,
          currentPage: page,
        },
      };
    } catch (error: any) {
      logger.warn(`Staff fetch error: ${error.message}`, {
        stack: error.stack,
      });
      return { status: 500, error: error.message };
    }
  }
}
