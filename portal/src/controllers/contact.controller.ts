import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { apiResponse } from '../types/res';

export async function addContact(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await AuthService.login(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getAll(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await AuthService.register(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getById(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await AuthService.forgetPassword(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}
