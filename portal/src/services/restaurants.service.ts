import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { Restaurant } from '../entity/Restaurant';
import { AppDataSource } from '../config/database';
import { User } from '../entity/User';
import { ILike } from 'typeorm';
import { AuthService } from './auth.service';
import { logger } from '../utils/logger';
export class RestaurantService {
  private static restaurantRepo = AppDataSource.getRepository(Restaurant);
  private static userRepo = AppDataSource.getRepository(User);

  static async createRestaurant(req: Request | any): Promise<apiResponse> {
    try {
      logger.info('Creating new restaurant');
      const tenantResult = await AuthService.genTenantId();
      if (tenantResult.status !== 200) {
        logger.error('Failed to create tenant for restaurant');
        return { status: 500, message: 'Failed to create tenant' };
      }
      const tenantId = tenantResult.data?.id;
      const {
        address,
        description,
        website,
        phoneNumber,
        email,
        restaurantName,
        restaurantType,
        seatingCapacity,
        colourTheme,
        restaurantLogo,
        operatingHours,
        city,
        state,
        country,
        postalCode,
      } = req.body;

      // Check if restaurant already exists
      const existingRestaurant = await this.restaurantRepo.findOneBy({
        restaurantName,
        tenantId: { id: tenantId },
      });

      if (existingRestaurant) {
        logger.warn(`Restaurant already exists: ${restaurantName}`);
        return { status: 400, message: 'Restaurant already exists!' };
      }

      let restaurant = this.restaurantRepo.create({
        address,
        description,
        website,
        phoneNumber,
        restaurantName,
        restaurantType,
        seatingCapacity,
        isBranch: false,
        email,
        colourTheme,
        restaurantLogo,
        operatingHours,
        city,
        state,
        country,
        postalCode,
        tenantId: { id: tenantId },
      });

      restaurant = await this.restaurantRepo.save(restaurant);
      if (!restaurant) {
        logger.error('Unable to create restaurant');
        return { status: 400, message: 'Unable to create restaurant' };
      }

      logger.info(
        `Restaurant created successfully: ${restaurant.restaurantName} (ID: ${restaurant.id})`,
      );
      return {
        status: 200,
        message: 'Restaurant created successfully!',
        data: restaurant,
      };
    } catch (error: any) {
      logger.error(`Error creating restaurant: ${error.message}`);
      return { status: 500, error: error.message };
    }
  }

  static async createRestaurantBranch(
    req: Request | any,
  ): Promise<apiResponse> {
    try {
      logger.info('Creating new restaurant branch');
      const {
        address,
        description,
        website,
        phoneNumber,
        email,
        restaurantName,
        restaurantType,
        seatingCapacity,
        parentRestaurantId,
        colourTheme,
        restaurantLogo,
        operatingHours,
        city,
        state,
        country,
        postalCode,
      } = req.body;

      if (!parentRestaurantId) {
        logger.warn('Parent restaurant ID is required for creating a branch');
        return {
          status: 400,
          message: 'Parent restaurant ID is required for creating a branch!',
        };
      }

      const parentRestaurant = await this.restaurantRepo.findOne({
        where: {
          id: parentRestaurantId,
          isBranch: false,
        },
        relations: ['tenantId', 'tables'],
      });

      if (!parentRestaurant) {
        logger.warn(`Parent restaurant not found: ${parentRestaurantId}`);
        return {
          status: 400,
          message: 'Parent restaurant not found or is not a valid parent!',
        };
      }
      const existingBranch = await this.restaurantRepo.findOne({
        where: {
          restaurantName,
          tenantId: { id: parentRestaurant.tenantId?.id },
          parentRestaurantId: { id: parentRestaurantId },
        },
        relations: ['tenantId', 'tables', 'parentRestaurantId'],
      });

      if (existingBranch) {
        logger.warn(
          `Branch already exists: ${restaurantName} under parent ${parentRestaurantId}`,
        );
        return {
          status: 400,
          message:
            'Branch with this name already exists under the parent restaurant!',
        };
      }

      let branchRestaurant = this.restaurantRepo.create({
        address,
        description,
        website,
        phoneNumber,
        restaurantName,
        restaurantType: restaurantType || parentRestaurant.restaurantType,
        seatingCapacity,
        isBranch: true,
        parentRestaurantId: { id: parentRestaurantId },
        email,
        colourTheme: colourTheme || parentRestaurant.colourTheme,
        restaurantLogo: restaurantLogo || parentRestaurant.restaurantLogo,
        operatingHours: operatingHours || parentRestaurant.operatingHours,
        city,
        state,
        country,
        postalCode,
        tenantId: { id: parentRestaurant?.tenantId?.id },
      });

      branchRestaurant = await this.restaurantRepo.save(branchRestaurant);
      if (!branchRestaurant) {
        logger.error('Unable to create restaurant branch');
        return { status: 400, message: 'Unable to create restaurant branch' };
      }

      logger.info(
        `Restaurant branch created successfully: ${branchRestaurant.restaurantName} (ID: ${branchRestaurant.id}) under parent ${parentRestaurantId}`,
      );
      return {
        status: 200,
        message: 'Restaurant branch created successfully!',
        data: branchRestaurant,
      };
    } catch (error: any) {
      logger.error(`Error creating restaurant branch: ${error.message}`);
      return { status: 500, error: error.message };
    }
  }

  static async getRestaurant(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;
      logger.info(`Fetching restaurant with ID: ${id}`);
      const restaurant = await this.restaurantRepo.findOne({
        where: {
          id,
          tenantId: { id: tenantId },
        },
        relations: ['tenantId', 'tables'],
      });
      if (!restaurant) {
        logger.warn(`Restaurant not found: ${id}`);
        return { status: 400, message: 'Restaurant not found!' };
      }
      logger.info(
        `Restaurant fetched successfully: ${restaurant.restaurantName} (ID: ${id})`,
      );
      return { status: 200, data: restaurant };
    } catch (error: any) {
      logger.error(`Error fetching restaurant: ${error.message}`);
      return { status: 500, error: error.message };
    }
  }

  static async getAllRestaurants(req: Request | any): Promise<apiResponse> {
    try {
      logger.info('Fetching all restaurants');
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const tenantId = req?.tenantId;
      const isBranch = req.query.isBranch as string;
      const search = req.query.search as string;
      const whereCondition: any = {
        tenantId: {
          id: tenantId,
        },
      };

      if (search) {
        whereCondition.restaurantName = ILike(`%${search}%`);
      }
      if (isBranch === 'true') {
        whereCondition.isBranch = true;
      }

      const [restaurants, total] = await this.restaurantRepo.findAndCount({
        where: whereCondition,
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
        relations: ['tenantId', 'tables'],
      });

      const totalPages = Math.ceil(total / limit);

      logger.info(
        `Fetched ${restaurants.length} restaurants (Total: ${total}, Page: ${page}/${totalPages})`,
      );
      return {
        status: 200,
        data: restaurants,
        meta: {
          totalItems: total,
          totalPages,
          currentPage: page,
        },
      };
    } catch (error: any) {
      logger.error(`Error fetching all restaurants: ${error.message}`);
      return { status: 500, error: error.message };
    }
  }

  static async getRestaurantBranches(req: Request | any): Promise<apiResponse> {
    try {
      const { parentId } = req.params;
      const tenantId = req?.tenantId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      logger.info(`Fetching branches for parent restaurant: ${parentId}`);
      // Verify parent restaurant exists
      const parentRestaurant = await this.restaurantRepo.findOne({
        where: {
          id: parentId,
          tenantId: { id: tenantId },
        },
        relations: ['tenantId', 'tables'],
      });

      if (!parentRestaurant) {
        logger.warn(`Parent restaurant not found: ${parentId}`);
        return { status: 400, message: 'Parent restaurant not found!' };
      }

      const [branches, total] = await this.restaurantRepo.findAndCount({
        where: {
          parentRestaurantId: { id: parentId },
          tenantId: { id: tenantId },
          isBranch: true,
        },
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
        relations: ['tenantId', 'parentRestaurantId'],
      });

      const totalPages = Math.ceil(total / limit);

      logger.info(
        `Fetched ${branches.length} branches for parent restaurant ${parentId} (Total: ${total}, Page: ${page}/${totalPages})`,
      );
      return {
        status: 200,
        data: branches,
        meta: {
          totalItems: total,
          totalPages,
          currentPage: page,
          parentRestaurant: {
            id: parentRestaurant.id,
            name: parentRestaurant.restaurantName,
          },
        },
      };
    } catch (error: any) {
      logger.error(`Error fetching restaurant branches: ${error.message}`);
      return { status: 500, error: error.message };
    }
  }

  static async updateRestaurant(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      logger.info(`Updating restaurant: ${id}`);
      const {
        address,
        description,
        website,
        phoneNumber,
        restaurantName,
        restaurantType,
        seatingCapacity,
        isBranch,
        parentRestaurantId,
        email,
        colourTheme,
        restaurantLogo,
        operatingHours,
        isActive,
      } = req.body;
      let restaurant = await this.restaurantRepo.findOneBy({
        id,
      });
      if (!restaurant) {
        logger.warn(`Restaurant not found for update: ${id}`);
        return { status: 400, message: 'Restaurant not found!' };
      }

      restaurant.address = address ? address : restaurant.address;
      restaurant.description = description
        ? description
        : restaurant.description;
      restaurant.website = website ? website : restaurant.website;
      restaurant.phoneNumber = phoneNumber
        ? phoneNumber
        : restaurant.phoneNumber;
      restaurant.restaurantName = restaurantName
        ? restaurantName
        : restaurant.restaurantName;
      restaurant.restaurantType = restaurantType
        ? restaurantType
        : restaurant.restaurantType;
      restaurant.seatingCapacity = seatingCapacity
        ? seatingCapacity
        : restaurant.seatingCapacity;
      restaurant.isBranch = isBranch ? isBranch : restaurant.isBranch;
      restaurant.parentRestaurantId = parentRestaurantId
        ? ({ id: parentRestaurantId } as unknown as Restaurant)
        : restaurant.parentRestaurantId;
      restaurant.email = email ? email : restaurant.email;
      restaurant.colourTheme = colourTheme
        ? colourTheme
        : restaurant.colourTheme;
      restaurant.restaurantLogo = restaurantLogo
        ? restaurantLogo
        : restaurant.restaurantLogo;
      restaurant.operatingHours = operatingHours
        ? operatingHours
        : restaurant.operatingHours;
      restaurant.isActive = isActive ? isActive : restaurant.isActive;
      restaurant = await this.restaurantRepo.save(restaurant);

      logger.info(
        `Restaurant updated successfully: ${restaurant.restaurantName} (ID: ${id})`,
      );
      return {
        status: 200,
        message: 'Restaurant updated successfully!',
        data: restaurant,
      };
    } catch (error: any) {
      logger.error(`Error updating restaurant: ${error.message}`);
      return { status: 500, error: error.message };
    }
  }

  static async deleteRestaurant(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;
      logger.info(`Attempting to delete restaurant: ${id}`);
      const restaurant = await this.restaurantRepo.findOneBy({
        id: id,
        tenantId: {
          id: tenantId,
        },
      });
      if (!restaurant) {
        logger.warn(`Restaurant not found for deletion: ${id}`);
        return { status: 400, message: 'Restaurant not found!' };
      }
      const usersWithRestaurant = await this.userRepo.count({
        where: {
          restaurantId: { id: id },
          tenantId: {
            id: tenantId,
          },
        },
      });

      if (usersWithRestaurant > 0) {
        logger.warn(
          `Cannot delete restaurant ${id}: assigned to ${usersWithRestaurant} users`,
        );
        return {
          status: 400,
          message:
            'Restaurant is assigned to one or more users and cannot be deleted.',
        };
      }
      await this.restaurantRepo.delete({ id: id });

      logger.info(
        `Restaurant deleted successfully: ${restaurant.restaurantName} (ID: ${id})`,
      );
      return { status: 200, message: 'Restaurant deleted successfully!' };
    } catch (error: any) {
      logger.error(`Error deleting restaurant: ${error.message}`);
      return { status: 500, error: error.message };
    }
  }
}
