import { Request, Response } from 'express';
import { UserService } from '../services/users.service';
import { apiResponse } from '../types/res';
import { RoleName } from '../entity/User';

export async function getAllUsers(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await UserService.getAllUsers(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getAllStaff(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await UserService.getAllUsers(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getUserById(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await UserService.getUserById(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getUserProfile(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await UserService.getUserProfile(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function createOwner(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await UserService.createUser(
      req,
      RoleName.OWNER,
    );
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function createStaff(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await UserService.createUser(
      req,
      RoleName.STAFF,
    );
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}
export async function deleteUser(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await UserService.deleteUser(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function updateUser(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await UserService.updateUser(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getUserAnalytics(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await UserService.getUserAnalytics(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getUserUsageAnalytics(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await UserService.userUsageAnalytics(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getAdminAnalytics(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await UserService.getAdminAnalytics(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}
