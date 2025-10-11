import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { apiResponse } from '../types/res';

export async function createCategory(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await CategoryService.createCategory(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getCategory(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await CategoryService.getCategory(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getAllCategories(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await CategoryService.getAllCategories(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function updateCategory(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await CategoryService.updateCategory(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function deleteCategory(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await CategoryService.deleteCategory(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}
