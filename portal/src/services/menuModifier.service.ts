import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { MenuModifier } from '../entity/MenuModifier';
import { AppDataSource } from '../config/database';
import { User } from '../entity/User';
import { ILike } from 'typeorm';

export class MenuModifierService {
  private static menuModifierRepo = AppDataSource.getRepository(MenuModifier);
  private static userRepo = AppDataSource.getRepository(User);

  static async createMenuModifier(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      const { menuItemId, name, price, description, isRequired } = req.body;

      // Verify menu exists and belongs to tenant
      const menu = await AppDataSource.getRepository('Menu').findOneBy({
        id: menuItemId,
        tenantId: { id: tenantId },
      });

      if (!menu) {
        return {
          status: 400,
          message: 'Menu not found or does not belong to tenant!',
        };
      }

      // Check if modifier with same name already exists for this menu
      const existingModifier = await this.menuModifierRepo.findOneBy({
        name,
        menu: { id: menuItemId },
      });

      if (existingModifier) {
        return {
          status: 400,
          message: 'Modifier with this name already exists for this menu!',
        };
      }

      let menuModifier = this.menuModifierRepo.create({
        menu: { id: menuItemId },
        name,
        price: price || 0,
        description,
        isRequired: isRequired || false,
      });

      menuModifier = await this.menuModifierRepo.save(menuModifier);
      if (!menuModifier) {
        return { status: 400, message: 'Unable to create menu modifier' };
      }

      return {
        status: 200,
        message: 'Menu modifier created successfully!',
        data: menuModifier,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getMenuModifier(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;
      const menuModifier = await this.menuModifierRepo.findOneBy({
        id: Number(id),
        tenantId: { id: tenantId },
      });
      if (!menuModifier) {
        return { status: 400, message: 'Menu modifier not found!' };
      }
      return { status: 200, data: menuModifier };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getAllMenuModifiers(req: Request | any): Promise<apiResponse> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const tenantId = req?.tenantId;
      const search = req.query.search as string;
      const menuItemId = req.query.menuItemId as string;

      const whereCondition: any = {};
      whereCondition.tenantId = { id: tenantId };

      if (search) {
        whereCondition.name = ILike(`%${search}%`);
      }

      if (menuItemId) {
        whereCondition.menu = { id: Number(menuItemId) };
      }

      const [menuModifiers, total] = await this.menuModifierRepo.findAndCount({
        where: whereCondition,
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        status: 200,
        data: menuModifiers,
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

  static async getModifiersByMenuItem(
    req: Request | any,
  ): Promise<apiResponse> {
    try {
      const { menuItemId } = req.params;
      const tenantId = req?.tenantId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Verify menu exists
      const menu = await AppDataSource.getRepository('Menu').findOneBy({
        id: Number(menuItemId),
        tenantId,
      });

      if (!menu) {
        return { status: 400, message: 'Menu not found!' };
      }

      const [modifiers, total] = await this.menuModifierRepo.findAndCount({
        where: {
          menu: { id: Number(menuItemId) },
        },
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        status: 200,
        data: modifiers,
        meta: {
          totalItems: total,
          totalPages,
          currentPage: page,
          menu: {
            id: menu.id,
            name: menu.menuName,
          },
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async updateMenuModifier(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const { name, price, description, isRequired, isActive } = req.body;
      const tenantId = req?.tenantId;

      let menuModifier = await this.menuModifierRepo.findOneBy({
        id: Number(id),
        tenantId,
      });

      if (!menuModifier) {
        return { status: 400, message: 'Menu modifier not found!' };
      }

      menuModifier.name = name ? name : menuModifier.name;
      menuModifier.price = price !== undefined ? price : menuModifier.price;
      menuModifier.description = description
        ? description
        : menuModifier.description;
      menuModifier.isRequired =
        isRequired !== undefined ? isRequired : menuModifier.isRequired;
      menuModifier.isActive =
        isActive !== undefined ? isActive : menuModifier.isActive;

      menuModifier = await this.menuModifierRepo.save(menuModifier);

      return {
        status: 200,
        message: 'Menu modifier updated successfully!',
        data: menuModifier,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async deleteMenuModifier(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;
      const menuModifier = await this.menuModifierRepo.findOneBy({
        id: Number(id),
        tenantId: { id: tenantId },
      });

      if (!menuModifier) {
        return { status: 400, message: 'Menu modifier not found!' };
      }

      await this.menuModifierRepo.delete({ id: Number(id) });

      return { status: 200, message: 'Menu modifier deleted successfully!' };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async duplicateMenuModifier(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const { newName, menuItemId } = req.body;
      const tenantId = req?.tenantId;

      // Get original modifier
      const originalModifier = await this.menuModifierRepo.findOneBy({
        id: Number(id),
        tenantId: { id: tenantId },
      });

      if (!originalModifier) {
        return { status: 400, message: 'Original menu modifier not found!' };
      }

      // Check if new modifier name already exists for this menu
      const existingModifier = await this.menuModifierRepo.findOneBy({
        name: newName,
        menu: { id: menuItemId || originalModifier.menu.id },
      });

      if (existingModifier) {
        return {
          status: 400,
          message: 'Modifier with this name already exists!',
        };
      }

      // Create duplicate
      let duplicateModifier = this.menuModifierRepo.create({
        menu: { id: menuItemId || originalModifier.menu.id },
        name: newName,
        price: originalModifier.price,
        description: originalModifier.description,
        isRequired: originalModifier.isRequired,
        isActive: true,
      });

      duplicateModifier = await this.menuModifierRepo.save(duplicateModifier);

      return {
        status: 200,
        message: 'Menu modifier duplicated successfully!',
        data: duplicateModifier,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }
}
