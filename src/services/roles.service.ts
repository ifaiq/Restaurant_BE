import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { Role } from '../entity/Role';
import { AppDataSource } from '../config/database';
import { RoleName, User } from '../entity/User';
import { ILike, IsNull, Not } from 'typeorm';
export class RoleService {
  private static roleRepo = AppDataSource.getRepository(Role);
  private static userRepo = AppDataSource.getRepository(User);

  static async createRole(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      const { name, permissions } = req.body;
      const existingRole = await this.roleRepo.findOneBy({ name, tenantId });

      if (!Array.isArray(permissions) || permissions.length === 0) {
        return {
          status: 400,
          message: 'Permissions must be a non-empty array!',
        };
      }

      for (const permission of permissions) {
        if (!permission.route || typeof permission.actions !== 'object') {
          return { status: 400, message: 'Invalid permissions format!' };
        }
      }

      if (existingRole) {
        return { status: 400, message: 'Role already exists!' };
      }
      let role = this.roleRepo.create({ name, permissions, tenantId });
      role = await this.roleRepo.save(role);
      if (!role) {
        return { status: 400, message: 'Unable to create role' };
      }
      return { status: 200, message: 'Role created successfully!', data: role };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getRole(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;
      const role = await this.roleRepo.findOneBy({ id: Number(id), tenantId });
      if (!role) {
        return { status: 400, message: 'Role not found!' };
      }
      return { status: 200, data: role };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getAllRoles(req: Request | any): Promise<apiResponse> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const tenantId = req?.tenantId;
      const search = req.query.search as string;
      const whereCondition: any = {
        tenantId: {
          id: tenantId,
        },
      };

      if (search) {
        whereCondition.name = ILike(`%${search}%`);
      }

      const [roles, total] = await this.roleRepo.findAndCount({
        where: whereCondition,
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        status: 200,
        data: roles,
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

  static async updateRole(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const { name, permissions } = req.body;
      const tenantId = req?.tenantId;
      let role = await this.roleRepo.findOneBy({
        id: Number(id),
        tenantId: {
          id: tenantId,
        },
      });
      if (!role) {
        return { status: 400, message: 'Role not found!' };
      }

      role.name = name ? name : role.name;
      role.permissions = permissions ? permissions : role.permissions;
      role = await this.roleRepo.save(role);

      return { status: 200, message: 'Role updated successfully!', data: role };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async deleteRole(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;
      const role = await this.roleRepo.findOneBy({
        id: Number(id),
        tenantId: {
          id: tenantId,
        },
      });
      if (!role) {
        return { status: 400, message: 'Role not found!' };
      }
      const usersWithRole = await this.userRepo.count({
        where: {
          role: { id: Number(id) },
          tenantId: {
            id: tenantId,
          },
        },
      });

      if (usersWithRole > 0) {
        return {
          status: 400,
          message:
            'Role is assigned to one or more users and cannot be deleted.',
        };
      }
      await this.roleRepo.delete({ id: Number(id) });

      return { status: 200, message: 'Role deleted successfully!' };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async analyticsRole(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      const totalRoles = await this.roleRepo.count({
        where: {
          tenantId: {
            id: tenantId,
          },
        },
      });
      const activeRoles = await this.userRepo.count({
        where: {
          tenantId: {
            id: tenantId,
          },
          isDeleted: false,
          isActive: true,
          roleName: RoleName.STAFF,
          role: Not(IsNull()),
        },
      });

      return {
        status: 200,
        data: {
          totalRoles,
          activeRoles,
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }
}
