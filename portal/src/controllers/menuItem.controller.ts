import { Request, Response } from 'express';
import { MenuItemService } from '../services/menuItem.service';
import { apiResponse } from '../types/res';

export async function createMenuItem(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await MenuItemService.create(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function updateMenuItem(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await MenuItemService.update(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function deleteMenuItem(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await MenuItemService.delete(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}
