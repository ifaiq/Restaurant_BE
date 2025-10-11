import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { AppDataSource } from '../config/database';
import { Category } from '../entity/Category';
import { ILike } from 'typeorm';

export class CategoryService {
  private static categoryRepo = AppDataSource.getRepository(Category);

  static async createCategory(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      const { name, restaurantId } = req.body;

      if (!tenantId) {
        return { status: 400, message: 'Tenant ID is required!' };
      }

      const restaurant = await AppDataSource.getRepository(
        'Restaurant',
      ).findOne({
        where: { id: restaurantId },
        relations: ['tenantId'],
      });

      if (!restaurant) {
        return { status: 400, message: 'Restaurant not found!' };
      }

      if (restaurant?.tenantId?.id !== tenantId) {
        return {
          status: 400,
          message: 'Restaurant does not belong to tenant!',
        };
      }

      const existing = await this.categoryRepo.findOne({
        where: {
          name: ILike(name),
          restaurantId: { id: restaurantId },
          tenantId: { id: tenantId },
        },
      });
      if (existing) {
        return {
          status: 400,
          message: 'Category with this name already exists!',
        };
      }

      let category = this.categoryRepo.create({
        name,
        restaurantId: { id: restaurantId },
        tenantId: { id: tenantId },
      });

      category = await this.categoryRepo.save(category);
      if (!category) {
        return { status: 400, message: 'Unable to create category' };
      }

      return {
        status: 200,
        message: 'Category created successfully!',
        data: category,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getCategory(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;

      const category = await this.categoryRepo.findOne({
        where: tenantId ? { id, tenantId: { id: tenantId } } : { id },
        relations: ['restaurantId', 'tenantId'],
      });
      if (!category) {
        return { status: 404, message: 'Category not found!' };
      }
      return { status: 200, data: category };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getAllCategories(req: Request | any): Promise<apiResponse> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const tenantId = req?.tenantId;
      const search = (req.query.search as string) || '';
      const restaurantId = req.query.restaurantId as string;
      const isActive = req.query.isActive as string;

      const where: any = {};
      if (tenantId) {
        where.tenantId = { id: tenantId };
      }
      if (restaurantId) {
        where.restaurantId = { id: restaurantId };
      }
      if (search) {
        where.name = ILike(`%${search}%`);
      }
      if (isActive === 'true' || isActive === 'false') {
        where.isActive = isActive === 'true';
      }

      const [categories, total] = await this.categoryRepo.findAndCount({
        where,
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      const totalPages = Math.ceil(total / limit);
      return {
        status: 200,
        data: categories,
        meta: { totalItems: total, totalPages, currentPage: page },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async updateCategory(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const { name, isDeleted } = req.body;
      const tenantId = req?.tenantId;

      let category = await this.categoryRepo.findOne({
        where: { id, tenantId: { id: tenantId } },
      });
      if (!category) {
        return { status: 404, message: 'Category not found!' };
      }

      if (name && name !== category.name) {
        const duplicate = await this.categoryRepo.findOne({
          where: {
            name: ILike(name),
            restaurantId: {
              id:
                (category as any).restaurantId?.id ||
                (category as any).restaurantId,
            },
            tenantId: { id: tenantId },
          },
        });
        if (duplicate) {
          return {
            status: 400,
            message: 'Another category with this name exists!',
          };
        }
      }

      category.name = name ?? category.name;
      category.isDeleted =
        typeof isDeleted === 'boolean' ? isDeleted : category.isDeleted;

      category = await this.categoryRepo.save(category);
      return {
        status: 200,
        message: 'Category updated successfully!',
        data: category,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async deleteCategory(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;

      const category = await this.categoryRepo.findOne({
        where: { id, tenantId: { id: tenantId } },
      });
      if (!category) {
        return { status: 404, message: 'Category not found!' };
      }

      await this.categoryRepo.softDelete({ id });
      return { status: 200, message: 'Category deleted successfully!' };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }
}
