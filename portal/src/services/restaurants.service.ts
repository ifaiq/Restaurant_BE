import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { Restaurant } from '../entity/Restaurant';
import { AppDataSource } from '../config/database';
import { User } from '../entity/User';
import { ILike } from 'typeorm';
import { AuthService } from './auth.service';
export class RestaurantService {
  private static restaurantRepo = AppDataSource.getRepository(Restaurant);
  private static userRepo = AppDataSource.getRepository(User);

  static async createRestaurant(req: Request | any): Promise<apiResponse> {
    try {
      const tenantResult = await AuthService.genTenantId();
      if (tenantResult.status !== 200) {
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
        return { status: 400, message: 'Unable to create restaurant' };
      }

      return {
        status: 200,
        message: 'Restaurant created successfully!',
        data: restaurant,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async createRestaurantBranch(
    req: Request | any,
  ): Promise<apiResponse> {
    try {
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
        return {
          status: 400,
          message: 'Parent restaurant ID is required for creating a branch!',
        };
      }

      const parentRestaurant = await this.restaurantRepo.findOneBy({
        id: parentRestaurantId,
        isBranch: false,
      });

      if (!parentRestaurant) {
        return {
          status: 400,
          message: 'Parent restaurant not found or is not a valid parent!',
        };
      }

      const existingBranch = await this.restaurantRepo.findOneBy({
        restaurantName,
        tenantId: parentRestaurant.tenantId,
        parentRestaurantId,
      });

      if (existingBranch) {
        return {
          status: 400,
          message:
            'Branch with this name already exists under the parent restaurant!',
        };
      }

      // Create branch restaurant
      let branchRestaurant = this.restaurantRepo.create({
        address,
        description,
        website,
        phoneNumber,
        restaurantName,
        restaurantType: restaurantType || parentRestaurant.restaurantType,
        seatingCapacity,
        isBranch: true,
        parentRestaurantId,
        email,
        colourTheme: colourTheme || parentRestaurant.colourTheme,
        restaurantLogo: restaurantLogo || parentRestaurant.restaurantLogo,
        operatingHours: operatingHours || parentRestaurant.operatingHours,
        city,
        state,
        country,
        postalCode,
        tenantId: parentRestaurant.tenantId,
      });

      branchRestaurant = await this.restaurantRepo.save(branchRestaurant);
      if (!branchRestaurant) {
        return { status: 400, message: 'Unable to create restaurant branch' };
      }

      return {
        status: 200,
        message: 'Restaurant branch created successfully!',
        data: branchRestaurant,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getRestaurant(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;
      const restaurant = await this.restaurantRepo.findOneBy({
        id: id,
        tenantId,
      });
      if (!restaurant) {
        return { status: 400, message: 'Restaurant not found!' };
      }
      return { status: 200, data: restaurant };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getAllRestaurants(req: Request | any): Promise<apiResponse> {
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
        whereCondition.restaurantName = ILike(`%${search}%`);
      }

      const [restaurants, total] = await this.restaurantRepo.findAndCount({
        where: whereCondition,
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      const totalPages = Math.ceil(total / limit);

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
      return { status: 500, error: error.message };
    }
  }

  static async getRestaurantBranches(req: Request | any): Promise<apiResponse> {
    try {
      const { parentId } = req.params;
      const tenantId = req?.tenantId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Verify parent restaurant exists
      const parentRestaurant = await this.restaurantRepo.findOneBy({
        id: parentId,
        tenantId,
        isBranch: false,
      });

      if (!parentRestaurant) {
        return { status: 400, message: 'Parent restaurant not found!' };
      }

      const [branches, total] = await this.restaurantRepo.findAndCount({
        where: {
          parentRestaurantId: { id: parentId },
          tenantId,
          isBranch: true,
        },
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      const totalPages = Math.ceil(total / limit);

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
      return { status: 500, error: error.message };
    }
  }

  static async updateRestaurant(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
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
      const tenantId = req?.tenantId;
      let restaurant = await this.restaurantRepo.findOneBy({
        id: id,
        tenantId: {
          id: tenantId,
        },
      });
      if (!restaurant) {
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
        ? parentRestaurantId
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

      return {
        status: 200,
        message: 'Restaurant updated successfully!',
        data: restaurant,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async deleteRestaurant(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;
      const restaurant = await this.restaurantRepo.findOneBy({
        id: id,
        tenantId: {
          id: tenantId,
        },
      });
      if (!restaurant) {
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
        return {
          status: 400,
          message:
            'Restaurant is assigned to one or more users and cannot be deleted.',
        };
      }
      await this.restaurantRepo.delete({ id: id });

      return { status: 200, message: 'Restaurant deleted successfully!' };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }
}
