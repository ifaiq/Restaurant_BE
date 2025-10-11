import { Request, Response } from 'express';
import { ModifierService } from '../services/modifier.service';
import { apiResponse } from '../types/res';

export async function createModifier(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await ModifierService.createModifier(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getAllModifiers(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await ModifierService.getAllModifiers(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function deleteModifier(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await ModifierService.deleteModifier(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}
