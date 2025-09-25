import { Request, Response } from 'express';
import { UserService } from '../services/users.service';
import { apiResponse } from '../types/res';

export async function getAllUsers(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await UserService.getAllUsers(req, 'USER');
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
    const { status, ...data } = await UserService.getAllUsers(req, 'STAFF');
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

export async function createUser(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await UserService.createUser(req);
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

export async function updateAllUsersDocViewable(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } =
      await UserService.updateAllUsersDocViewable(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function addERPUser(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await UserService.addERPUser();
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function changeUserStatus(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await UserService.changeUserStatus(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getExampleExcel(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await UserService.getExampleExcel();
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function importExcelUsers(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await UserService.importUsersFromExcel(req);
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
