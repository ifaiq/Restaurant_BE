import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { AppDataSource } from '../config/database';
import { Modifier } from '../entity/Modifiers';
import { ILike } from 'typeorm';

export class ModifierService {
  private static modifierRepo = AppDataSource.getRepository(Modifier);

  static async createModifier(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      const {
        name,
        price,
        description,
        picture,
        isActive,
        isRequired,
        isGlobal,
        restaurantId,
      } = req.body;

      if (isGlobal && !restaurantId) {
        return {
          status: 400,
          message: 'restaurantId is required for global modifier',
        };
      }

      const modifier = this.modifierRepo.create({
        name,
        description,
        price,
        picture,
        isActive: isActive ?? true,
        isRequired: isRequired ?? false,
        isGlobal: isGlobal ?? false,
        restaurant: restaurantId ? ({ id: restaurantId } as any) : undefined,
        tenant: tenantId ? ({ id: tenantId } as any) : undefined,
      });

      const saved = await this.modifierRepo.save(modifier);
      return {
        status: 200,
        message: 'Modifier created successfully!',
        data: saved,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getAllModifiers(req: Request | any): Promise<apiResponse> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const restaurantId = req.query.restaurantId as string;
      const isGlobal = req.query.isGlobal as string;

      const where: any = {};
      if (restaurantId) where.restaurant = { id: restaurantId };
      if (isGlobal === 'true' || isGlobal === 'false')
        where.isGlobal = isGlobal === 'true';
      if (search) where.name = ILike(`%${search}%`);

      const [rows, total] = await this.modifierRepo.findAndCount({
        where,
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      return {
        status: 200,
        data: rows,
        meta: {
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async deleteModifier(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;

      const existing = await this.modifierRepo.findOne({
        where: { id, tenant: { id: tenantId } },
      });
      if (!existing) {
        return { status: 404, message: 'Modifier not found!' };
      }

      await this.modifierRepo.delete({ id });
      return { status: 200, message: 'Modifier deleted successfully!' };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }
}
