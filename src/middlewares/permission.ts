import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entity/User';
import { Role } from '../entity/Role';
import { checkPermissions } from '../utils/checkPermissionHelper';

const userRepo = AppDataSource.getRepository(User);
export const permissions = async (
  req: Request | any,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const url = req?.baseUrl;
    const parts = url.split('/');
    const lastName = parts[parts.length - 1].toLowerCase();
    const user = await userRepo.findOne({
      where: { id: req.user?.id },
      relations: { role: true },
    });
    if (!user) {
      return res
        .status(403)
        .json({ status: 403, message: 'You are not authenticated!' });
    }

    if (user?.isAdmin) {
      return next();
    } else {
      const userRole = Number(user?.role?.id);
      const roleRepository = await AppDataSource.getRepository(Role);

      const roleData = await roleRepository.findOne({
        where: {
          id: userRole,
        },
      });
      const routesArray = roleData?.permissions?.map((ele) => ele.route);
      if (routesArray?.includes(lastName) || routesArray?.includes('all')) {
        req.permissionData = roleData;
        const permissionCheck = await checkPermissions(req, user);
        if (permissionCheck.status !== 200) {
          return res.status(permissionCheck.status).json(permissionCheck);
        }
        return next();
      } else {
        return res
          .status(403)
          .json({ status: 403, message: 'You are not allowed on this route!' });
      }
    }
  } catch (error: any) {
    return res.status(500).json({ status: 403, message: error.message });
  }
};
