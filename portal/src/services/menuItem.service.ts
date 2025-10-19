import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { AppDataSource } from '../config/database';
import { ILike } from 'typeorm';
import { Menu } from '../entity/Menu';
import { MenuItem } from '../entity/MenuItem';
import { MenuItemModifier } from '../entity/MenuItemModifier';
import { Category } from '../entity/Category';
import { Modifier } from '../entity/Modifiers';

export class MenuItemService {
  private static menuRepo = AppDataSource.getRepository(Menu);
  private static itemRepo = AppDataSource.getRepository(MenuItem);
  private static itemModRepo = AppDataSource.getRepository(MenuItemModifier);

  static async getAll(req: Request | any): Promise<apiResponse> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const tenantId = req?.tenantId;
      const search = (req.query.search as string) || '';
      const restaurantId = req.query.restaurantId as string;
      const categoryId = req.query.categoryId as string;
      const isActive = req.query.isActive as string;

      const where: any = {
        restaurant: { tenantId: { id: tenantId } },
      };
      if (restaurantId) where.restaurant.id = restaurantId;
      if (categoryId) where.category = { id: categoryId };
      if (search) where.itemName = ILike(`%${search}%`);
      if (isActive === 'true' || isActive === 'false')
        where.isActive = isActive === 'true';

      const [items, total] = await this.itemRepo.findAndCount({
        where,
        relations: ['category', 'restaurant'],
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      return {
        status: 200,
        data: items,
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

  static async getAllRestaurantMenuItems(
    req: Request | any,
  ): Promise<apiResponse> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const restaurantId = req.params.restaurantId as string;
      const tableId = req.params.tableId as string;
      const categoryId = req.query.categoryId as string;
      const isActive = req.query.isActive as string;
      if (!restaurantId) {
        return {
          status: 400,
          message: 'Restaurant ID is required',
        };
      }
      if (!tableId) {
        return {
          status: 400,
          message: 'Table ID is required',
        };
      }
      const where: any = {
        restaurant: { id: restaurantId },
      };
      if (categoryId) where.category = { id: categoryId };
      if (search) where.itemName = ILike(`%${search}%`);
      if (isActive === 'true' || isActive === 'false')
        where.isActive = isActive === 'true';

      const [items, total] = await this.itemRepo.findAndCount({
        where,
        relations: ['category', 'restaurant'],
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      return {
        status: 200,
        data: items,
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

  static async create(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      const {
        restaurantId,
        itemName,
        description,
        price,
        picture,
        categoryId,
        isActive,
        isVegetarian,
        isVegan,
        isGlutenFree,
        isSpicy,
        nutritionalInfo,
        customizations,
        modifierIds,
      } = req.body;
      if (!restaurantId) {
        return {
          status: 400,
          message: 'Restaurant ID is required',
        };
      }
      if (categoryId) {
        return {
          status: 400,
          message: 'Category ID is required',
        };
      }
      if (tenantId) {
        return {
          status: 400,
          message: 'Tenant ID is required',
        };
      }
      // Validate restaurant belongs to tenant via any menu lookup or direct repository
      const restaurant = await AppDataSource.getRepository(
        'Restaurant',
      ).findOne({
        where: { id: restaurantId, tenantId: { id: tenantId } },
        relations: ['tenantId'],
      });
      if (!restaurant) return { status: 404, message: 'Restaurant not found!' };

      // Optional: validate category belongs to the same restaurant/tenant
      let category: any = undefined;
      if (categoryId) {
        category = await AppDataSource.getRepository(Category).findOne({
          where: {
            id: categoryId,
            restaurantId: { id: restaurantId },
            isDeleted: false,
          },
          relations: ['restaurantId'],
        });
        if (!category) {
          return {
            status: 400,
            message: 'Invalid category for this restaurant',
          };
        }
      }

      let item = this.itemRepo.create({
        restaurant: { id: restaurantId } as any,
        itemName,
        description,
        price,
        picture,
        category: categoryId ? ({ id: categoryId } as any) : undefined,
        isActive: isActive ?? true,
        isVegetarian: isVegetarian ?? false,
        isVegan: isVegan ?? false,
        isGlutenFree: isGlutenFree ?? false,
        isSpicy: isSpicy ?? false,
        nutritionalInfo,
        customizations,
        modifierLinks: (modifierIds || []).map((id: string) => ({
          modifier: { id } as Modifier,
        })) as any,
      });

      item = await this.itemRepo.save(item);
      return {
        status: 200,
        message: 'Menu item created successfully!',
        data: item,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async update(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      const { id } = req.params;
      const {
        itemName,
        description,
        price,
        picture,
        categoryId,
        isActive,
        isVegetarian,
        isVegan,
        isGlutenFree,
        isSpicy,
        nutritionalInfo,
        customizations,
        modifierIds,
      } = req.body;

      let item = await this.itemRepo.findOne({
        where: { id },
        relations: ['restaurant', 'modifierLinks', 'modifierLinks.modifier'],
      });
      if (!item) return { status: 404, message: 'Menu item not found!' };
      if (((item as any).restaurant as any)?.tenantId?.id !== tenantId) {
        return { status: 403, message: 'Not allowed to modify this item' };
      }

      if (categoryId) {
        const validCategory = await AppDataSource.getRepository(
          Category,
        ).findOne({
          where: {
            id: categoryId,
            restaurantId: { id: (item as any).restaurant?.id },
            isDeleted: false,
          },
          relations: ['restaurantId'],
        });
        if (!validCategory) {
          return {
            status: 400,
            message: 'Invalid category for this restaurant',
          };
        }
        (item as any).category = { id: categoryId } as any;
      }

      item.itemName = itemName ?? item.itemName;
      item.description = description ?? item.description;
      item.price = price ?? item.price;
      item.picture = picture ?? item.picture;
      item.isActive = typeof isActive === 'boolean' ? isActive : item.isActive;
      item.isVegetarian =
        typeof isVegetarian === 'boolean' ? isVegetarian : item.isVegetarian;
      item.isVegan = typeof isVegan === 'boolean' ? isVegan : item.isVegan;
      item.isGlutenFree =
        typeof isGlutenFree === 'boolean' ? isGlutenFree : item.isGlutenFree;
      item.isSpicy = typeof isSpicy === 'boolean' ? isSpicy : item.isSpicy;
      item.nutritionalInfo = nutritionalInfo ?? item.nutritionalInfo;
      item.customizations = customizations ?? item.customizations;

      if (Array.isArray(modifierIds)) {
        // Replace modifier links
        await this.itemModRepo.delete({ menuItem: { id } as any });
        (item as any).modifierLinks = modifierIds.map((modId: string) => ({
          modifier: { id: modId } as Modifier,
        })) as any;
      }

      item = await this.itemRepo.save(item);
      return {
        status: 200,
        message: 'Menu item updated successfully!',
        data: item,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async delete(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      const { id } = req.params;

      const item = await this.itemRepo.findOne({
        where: { id },
        relations: ['restaurant'],
      });
      if (!item) return { status: 404, message: 'Menu item not found!' };
      if (((item as any).restaurant as any)?.tenantId?.id !== tenantId) {
        return { status: 403, message: 'Not allowed to delete this item' };
      }

      await this.itemRepo.delete({ id });
      return { status: 200, message: 'Menu item deleted successfully!' };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }
}
