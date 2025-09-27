import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { Menu } from '../entity/Menu';
import { AppDataSource } from '../config/database';
import { User } from '../entity/User';
import { ILike } from 'typeorm';

export class MenuService {
  private static menuRepo = AppDataSource.getRepository(Menu);
  private static userRepo = AppDataSource.getRepository(User);

  static async createMenu(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      const {
        menuName,
        description,
        restaurantId,
        menuType,
        status,
        language,
        currency,
        categories,
        menuItems,
        modifiers,
      } = req.body;

      // Check if menu already exists for this restaurant
      const existingMenu = await this.menuRepo.findOneBy({
        menuName,
        restaurantId: { id: restaurantId },
        tenantId,
      });

      if (existingMenu) {
        return {
          status: 400,
          message: 'Menu with this name already exists for this restaurant!',
        };
      }

      // Verify restaurant exists and belongs to tenant
      const restaurant = await AppDataSource.getRepository(
        'Restaurant',
      ).findOneBy({
        id: restaurantId,
        tenantId,
      });

      if (!restaurant) {
        return {
          status: 400,
          message: 'Restaurant not found or does not belong to tenant!',
        };
      }

      let menu = this.menuRepo.create({
        menuName,
        description,
        restaurantId: { id: restaurantId },
        menuType,
        status,
        language,
        currency,
        categories,
        menuItems,
        modifiers,
        tenantId,
      });

      menu = await this.menuRepo.save(menu);
      if (!menu) {
        return { status: 400, message: 'Unable to create menu' };
      }

      return {
        status: 200,
        message: 'Menu created successfully!',
        data: menu,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getMenu(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;
      const menu = await this.menuRepo.findOneBy({
        id: Number(id),
        tenantId,
      });
      if (!menu) {
        return { status: 400, message: 'Menu not found!' };
      }
      return { status: 200, data: menu };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getAllMenus(req: Request | any): Promise<apiResponse> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const tenantId = req?.tenantId;
      const search = req.query.search as string;
      const restaurantId = req.query.restaurantId as string;

      const whereCondition: any = {
        tenantId: {
          id: tenantId,
        },
      };

      if (search) {
        whereCondition.menuName = ILike(`%${search}%`);
      }

      if (restaurantId) {
        whereCondition.restaurantId = { id: Number(restaurantId) };
      }

      const [menus, total] = await this.menuRepo.findAndCount({
        where: whereCondition,
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        status: 200,
        data: menus,
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

  static async getMenusByRestaurant(req: Request | any): Promise<apiResponse> {
    try {
      const { restaurantId } = req.params;
      const tenantId = req?.tenantId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Verify restaurant exists
      const restaurant = await AppDataSource.getRepository(
        'Restaurant',
      ).findOneBy({
        id: Number(restaurantId),
        tenantId,
      });

      if (!restaurant) {
        return { status: 400, message: 'Restaurant not found!' };
      }

      const [menus, total] = await this.menuRepo.findAndCount({
        where: {
          restaurantId: { id: Number(restaurantId) },
          tenantId,
        },
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        status: 200,
        data: menus,
        meta: {
          totalItems: total,
          totalPages,
          currentPage: page,
          restaurant: {
            id: restaurant.id,
            name: restaurant.restaurantName,
          },
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async updateMenu(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const {
        menuName,
        description,
        menuType,
        status,
        language,
        currency,
        categories,
        menuItems,
        modifiers,
        isActive,
      } = req.body;
      const tenantId = req?.tenantId;

      let menu = await this.menuRepo.findOneBy({
        id: Number(id),
        tenantId,
      });

      if (!menu) {
        return { status: 400, message: 'Menu not found!' };
      }

      menu.menuName = menuName ? menuName : menu.menuName;
      menu.description = description ? description : menu.description;
      menu.menuType = menuType ? menuType : menu.menuType;
      menu.status = status ? status : menu.status;
      menu.language = language ? language : menu.language;
      menu.currency = currency ? currency : menu.currency;
      menu.categories = categories ? categories : menu.categories;
      menu.menuItems = menuItems ? menuItems : menu.menuItems;
      menu.modifiers = modifiers ? modifiers : menu.modifiers;
      menu.isActive = isActive ? isActive : menu.isActive;

      menu = await this.menuRepo.save(menu);

      return {
        status: 200,
        message: 'Menu updated successfully!',
        data: menu,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async deleteMenu(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;
      const menu = await this.menuRepo.findOneBy({
        id: Number(id),
        tenantId,
      });

      if (!menu) {
        return { status: 400, message: 'Menu not found!' };
      }

      await this.menuRepo.delete({ id: Number(id) });

      return { status: 200, message: 'Menu deleted successfully!' };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }
}
