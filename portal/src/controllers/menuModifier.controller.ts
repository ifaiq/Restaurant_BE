import { Request, Response } from 'express';
import { MenuModifierService } from '../services/menuModifier.service';
import { apiResponse } from '../types/res';

export async function createMenuModifier(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } =
      await MenuModifierService.createMenuModifier(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getMenuModifier(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await MenuModifierService.getMenuModifier(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getAllMenuModifiers(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } =
      await MenuModifierService.getAllMenuModifiers(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getModifiersByMenuItem(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } =
      await MenuModifierService.getModifiersByMenuItem(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function updateMenuModifier(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } =
      await MenuModifierService.updateMenuModifier(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function deleteMenuModifier(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } =
      await MenuModifierService.deleteMenuModifier(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function duplicateMenuModifier(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } =
      await MenuModifierService.duplicateMenuModifier(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}
