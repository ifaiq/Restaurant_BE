import { Request, Response } from 'express';
import { RestaurantService } from '../services/restaurants.service';
import { apiResponse } from '../types/res';

export async function createRestaurant(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await RestaurantService.createRestaurant(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function createRestaurantBranch(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } =
      await RestaurantService.createRestaurantBranch(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getRestaurant(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await RestaurantService.getRestaurant(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getAllRestaurants(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await RestaurantService.getAllRestaurants(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getRestaurantBranches(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } =
      await RestaurantService.getRestaurantBranches(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function updateRestaurant(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await RestaurantService.updateRestaurant(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function deleteRestaurant(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await RestaurantService.deleteRestaurant(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}
