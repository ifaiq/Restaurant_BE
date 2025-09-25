import { Request, Response } from 'express';
import { RoleService } from '../services/roles.service';
import { apiResponse } from '../types/res';

export async function createRole(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await RoleService.createRole(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getRole(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await RoleService.getRole(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getAllRoles(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await RoleService.getAllRoles(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function updateRole(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await RoleService.updateRole(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function deleteRole(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await RoleService.deleteRole(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function analyticsRole(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await RoleService.analyticsRole(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}
