import { Request, Response } from 'express';
import { MenuService } from '../services/menu.service';
import { apiResponse } from '../types/res';

export async function createMenu(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await MenuService.createMenu(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getMenu(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await MenuService.getMenu(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getAllMenus(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await MenuService.getAllMenus(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getMenusByRestaurant(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await MenuService.getMenusByRestaurant(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function updateMenu(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await MenuService.updateMenu(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function deleteMenu(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await MenuService.deleteMenu(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}
