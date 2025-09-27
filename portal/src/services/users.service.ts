import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { RoleName, User } from '../entity/User';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { Between, ILike, In } from 'typeorm';
//import { loginInfoEmailTemplate } from '../helper/mailTemplate';
import { MongoClient } from 'mongodb';
// import { EmailQueueProducer } from '../queues/producer/emailQueue.producer';

export class UserService {
  private static userRepo = AppDataSource.getRepository(User);
  // private static emailQueueProducer = new EmailQueueProducer();
  static async createUser(req: Request | any): Promise<apiResponse> {
    try {
      const { email, name, country, roleName, restaurantId, password } =
        req.body;

      let tenantId;
      if (restaurantId) {
        const restaurant = await AppDataSource.getRepository(
          'Restaurant',
        ).findOne({
          where: { id: restaurantId },
          relations: ['tenantId'],
        });

        if (!restaurant) {
          return { status: 400, message: 'Restaurant not found!' };
        }

        tenantId = restaurant.tenantId;
      } else {
        return { status: 400, message: 'Restaurant ID is required!' };
      }

      const existingUser = await this.userRepo.findOneBy({ email, tenantId });
      if (existingUser) {
        return { status: 404, message: 'User with this email already exists!' };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User();
      newUser.email = email;
      newUser.password = hashedPassword;
      newUser.name = name;
      newUser.country = country;
      newUser.isActive = true;
      newUser.roleName = roleName;
      newUser.tenantId = tenantId;
      newUser.restaurantId = restaurantId;
      const user = await this.userRepo.save(newUser);
      if (!user) {
        return { status: 400, message: 'Unable to create user' };
      }
      //const passwordField = loginInfoEmailTemplate(password);
      // await this.emailQueueProducer.addEmailJob(
      //   email,
      //   passwordField,
      //   {},
      //   'Login Details',
      // );
      return { status: 200, message: 'User created successfully!', data: user };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getUserById(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;
      const userData = await this.userRepo.findOne({
        where: {
          id: Number(id),
          isDeleted: false,
          tenantId: {
            id: tenantId,
          },
        },
      });
      if (!userData) {
        return { status: 400, message: 'User not found!' };
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
          id: Number(id),
          isDeleted: false,
          tenantId: {
            id: tenantId,
          },
        },
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
        id: Number(id),
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

      return { status: 200, message: 'User deleted successfully!' };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async updateUser(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;

      const { country, name } = req.body;
      let userData = await this.userRepo.findOne({
        where: {
          id: Number(id),
          tenantId: {
            id: tenantId,
          },
          isDeleted: false,
        },
      });
      if (!userData) {
        return { status: 400, message: 'User not found!' };
      }

      userData.name = name ?? userData.name;
      userData.country = country ?? userData.country;
      userData = await this.userRepo.save(userData);

      return {
        status: 200,
        message: 'User updated successfully!',
        data: userData,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getAllUsers(
    req: Request | any,
    type: string,
  ): Promise<apiResponse> {
    try {
      const userTypeCondition =
        type === RoleName.OWNER
          ? [RoleName.OWNER, RoleName.STAFF]
          : [RoleName.STAFF];
      const tenantId = req?.tenantId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search ? req.query.search.toString() : null;
      const departmentId = req.query.departmentId
        ? req.query.departmentId
        : null;
      const roleName = req.query?.roleName;
      const status = req.query.status;

      const baseCondition: any = {
        roleName: In(userTypeCondition),
        tenantId: { id: tenantId },
        isDeleted: false,
      };
      if (search) {
        baseCondition['name'] = ILike(`%${search}%`);
      }
      if (roleName) {
        baseCondition['roleName'] = roleName;
      }

      if (departmentId) {
        baseCondition['department'] = {
          id: departmentId,
          tenantId: { id: tenantId },
        };
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
        relations: ['company', 'department', 'groups', 'role', 'manager'],
        order: {
          createdAt: 'DESC',
        },
      });

      const totalPages = Math.ceil(total / limit);
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
          tenantId: {
            id: tenantId,
          },
        },
        take: limit,
        skip: (page - 1) * limit,
        relations: ['company', 'department', 'role'],
        order: {
          updatedAt: 'DESC',
        },
      });

      const totalPages = Math.ceil(total / limit);

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
}
