import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { Menu, MenuStatus } from '../entity/Menu';
import { Category } from '../entity/Category';
import { AppDataSource } from '../config/database';
import { User } from '../entity/User';
import { ILike } from 'typeorm';

export class MenuService {
  private static menuRepo = AppDataSource.getRepository(Menu);
  private static userRepo = AppDataSource.getRepository(User);

  static async createMenu(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      if (!tenantId) {
        return { status: 400, message: 'Tenant ID is required!' };
      }
      const { menuName, description, restaurantId, menuItems } = req.body;

      const existingMenu = await this.menuRepo.findOne({
        where: {
          menuName,
          restaurant: { id: restaurantId },
          tenant: { id: tenantId },
        },
      });
      if (existingMenu) {
        return {
          status: 400,
          message: 'Menu with this name already exists for this restaurant!',
        };
      }

      const restaurant = await AppDataSource.getRepository(
        'Restaurant',
      ).findOne({
        where: { id: restaurantId, tenantId: { id: tenantId } },
        relations: ['tenantId'],
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
        restaurant: { id: restaurantId } as any,
        menuItems,
        tenant: { id: tenantId } as any,
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
      const { id, restaurantId } = req.params;
      const menu = await this.menuRepo.findOne({
        where: { id, restaurant: { id: restaurantId } },
        relations: ['menuItems', 'menuItems.category', 'restaurant'],
      });
      if (!menu) {
        return { status: 400, message: 'Menu not found!' };
      }
      const categories = await AppDataSource.getRepository(Category).find({
        where: { restaurantId: { id: restaurantId }, isDeleted: false },
        order: { createdAt: 'DESC' },
      });
      const globalModifiers = await AppDataSource.getRepository(
        'Modifier',
      ).find({
        where: { restaurant: { id: restaurantId }, isGlobal: true },
        order: { createdAt: 'DESC' },
      } as any);
      const categoryMap = new Map(
        categories.map((c: any) => [c.id, { id: c.id, name: c.name }]),
      );
      const enrichedItems = menu.menuItems?.map((item: any) => ({
        ...item,
        category:
          item.category ||
          (item.categoryId ? categoryMap.get(item.categoryId) : null),
      }));
      return {
        status: 200,
        data: {
          ...menu,
          categories,
          menuItems: enrichedItems,
          globalModifiers,
        },
      };
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
        tenant: { id: tenantId },
      };

      if (search) {
        whereCondition.menuName = ILike(`%${search}%`);
      }

      if (restaurantId) {
        whereCondition.restaurant = { id: restaurantId };
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

      const [menus, total] = await this.menuRepo.findAndCount({
        where: { restaurant: { id: restaurantId }, tenant: { id: tenantId } },
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      const categories = await AppDataSource.getRepository(Category).find({
        where: {
          restaurantId: { id: restaurantId },
          tenantId: { id: tenantId },
          isDeleted: false,
        },
        order: { createdAt: 'DESC' },
      });
      const globalModifiers = await AppDataSource.getRepository(
        'Modifier',
      ).find({
        where: { restaurant: { id: restaurantId }, isGlobal: true },
        order: { createdAt: 'DESC' },
      } as any);

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
          categories,
          globalModifiers,
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async updateMenu(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const { menuName, description, status, language, currency, menuItems } =
        req.body;
      const tenantId = req?.tenantId;

      let menu = await this.menuRepo.findOne({
        where: { id, tenant: { id: tenantId } },
      });

      if (!menu) {
        return { status: 400, message: 'Menu not found!' };
      }

      menu.menuName = menuName ? menuName : menu.menuName;
      menu.description = description ? description : menu.description;
      // normalize status on update
      const normalizedUpdateStatus = (() => {
        if (!status) return undefined;
        switch (String(status).toLowerCase()) {
          case 'active':
            return MenuStatus.ACTIVE;
          case 'inactive':
            return MenuStatus.INACTIVE;
          case 'draft':
            return MenuStatus.DRAFT;
          case 'archived':
            return MenuStatus.ARCHIVED;
          default:
            return status;
        }
      })();
      menu.status = normalizedUpdateStatus
        ? (normalizedUpdateStatus as any)
        : menu.status;
      menu.language = language ? language : menu.language;
      menu.currency = currency ? currency : menu.currency;
      menu.menuItems = menuItems ? menuItems : menu.menuItems;

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
      const menu = await this.menuRepo.findOne({
        where: { id, tenant: { id: tenantId } },
      });

      if (!menu) {
        return { status: 400, message: 'Menu not found!' };
      }

      await this.menuRepo.delete({ id: id });

      return { status: 200, message: 'Menu deleted successfully!' };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getMenuWithModifiers(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;
      const menu = await this.menuRepo.findOne({
        where: { id, tenant: { id: tenantId } },
        relations: [
          'menuItems',
          'menuItems.modifierLinks',
          'menuItems.modifierLinks.modifier',
          'menuItems.category',
          'restaurant',
        ],
      });

      if (!menu) {
        return { status: 400, message: 'Menu not found!' };
      }

      // Process menu items to include their applicable modifiers
      const processedMenu = {
        ...menu,
        menuItems: menu.menuItems?.map((item: any) => {
          const modifiers = (item.modifierLinks || []).map(
            (link: any) => link.modifier,
          );
          return {
            ...item,
            modifiers,
          };
        }),
      };

      const categories = await AppDataSource.getRepository(Category).find({
        where: {
          restaurantId: { id: (menu as any).restaurant?.id },
          tenantId: { id: tenantId },
          isDeleted: false,
        },
        order: { createdAt: 'DESC' },
      });
      const globalModifiers = await AppDataSource.getRepository(
        'Modifier',
      ).find({
        where: {
          restaurant: { id: (menu as any).restaurant?.id },
          isGlobal: true,
        },
        order: { createdAt: 'DESC' },
      } as any);

      const enrichedItems = processedMenu.menuItems?.map((item: any) => ({
        ...item,
        category: item.category || null,
      }));
      return {
        status: 200,
        data: {
          ...processedMenu,
          categories,
          menuItems: enrichedItems,
          globalModifiers,
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }
}
