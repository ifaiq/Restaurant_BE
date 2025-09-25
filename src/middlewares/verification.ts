import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export const verifyToken = (
  req: any,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.token;
    if (authHeader) {
      const token = Array.isArray(authHeader) ? authHeader[0] : authHeader;
      const user = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as JwtPayload;
      if (
        user?.roleName !== 'SUPER_ADMIN' &&
        user?.tenantId?.id &&
        user?.tenantId?.tenantId
      ) {
        req.user = user;
        req.tenantId = user?.tenantId?.id;
        next();
      } else if (user?.roleName === 'SUPER_ADMIN') {
        req.user = user;
        next();
      } else {
        res
          .status(403)
          .json({ status: 403, message: 'You are not authorized!' });
      }
    } else {
      res
        .status(401)
        .json({ status: 401, message: 'You are not authenticated!' });
    }
  } catch (error: any) {
    res.status(401).json({ status: 401, message: error.message });
  }
};

export const verifyTokenAndAuthorization = (
  req: any,
  res: Response,
  next: NextFunction,
): void => {
  try {
    verifyToken(req, res, () => {
      if (req.user.id === req.params.id || req.user.isAdmin) {
        next();
      } else {
        res
          .status(401)
          .json({ status: 401, message: 'You are not authenticated!' });
      }
    });
  } catch (error: any) {
    res.status(401).json({ status: 401, message: error.message });
  }
};

export const verifyTokenAndAdmin = (
  req: any,
  res: Response,
  next: NextFunction,
): void => {
  try {
    verifyToken(req, res, () => {
      if (req.user.isAdmin || req.user.roleName === 'STAFF') {
        next();
      } else {
        res
          .status(401)
          .json({ status: 401, message: 'You are not authenticated!' });
      }
    });
  } catch (error: any) {
    res.status(401).json({ status: 401, message: error.message });
  }
};

export const verifyTokenAndSuperAdmin = (
  req: any,
  res: Response,
  next: NextFunction,
): void => {
  try {
    verifyToken(req, res, () => {
      if (req.user.isAdmin && req.user.roleName === 'SUPER_ADMIN') {
        next();
      } else {
        res
          .status(401)
          .json({ status: 401, message: 'You are not authenticated!' });
      }
    });
  } catch (error: any) {
    res.status(401).json({ status: 401, message: error.message });
  }
};
