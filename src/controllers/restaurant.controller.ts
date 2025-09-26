import { Request, Response } from 'express';
import { RestaurantService } from '../services/restaurants.service';

export class RestaurantController {
  static async createRestaurant(req: Request, res: Response) {
    try {
      const result = await RestaurantService.createRestaurant(req);
      return res.status(result.status).json(result);
    } catch (error: any) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  static async createRestaurantBranch(req: Request, res: Response) {
    try {
      const result = await RestaurantService.createRestaurantBranch(req);
      return res.status(result.status).json(result);
    } catch (error: any) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  static async getRestaurant(req: Request, res: Response) {
    try {
      const result = await RestaurantService.getRestaurant(req);
      return res.status(result.status).json(result);
    } catch (error: any) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  static async getAllRestaurants(req: Request, res: Response) {
    try {
      const result = await RestaurantService.getAllRestaurants(req);
      return res.status(result.status).json(result);
    } catch (error: any) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  static async getRestaurantBranches(req: Request, res: Response) {
    try {
      const result = await RestaurantService.getRestaurantBranches(req);
      return res.status(result.status).json(result);
    } catch (error: any) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  static async updateRestaurant(req: Request, res: Response) {
    try {
      const result = await RestaurantService.updateRestaurant(req);
      return res.status(result.status).json(result);
    } catch (error: any) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  static async deleteRestaurant(req: Request, res: Response) {
    try {
      const result = await RestaurantService.deleteRestaurant(req);
      return res.status(result.status).json(result);
    } catch (error: any) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }
}
