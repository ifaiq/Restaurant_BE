import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const extractTokenFromHeader = (
  authHeader: string | undefined,
): string | null => {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

export const verifyToken = (
  req: any,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    if (token) {
      const user = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as JwtPayload;
      if (user?.roleName !== 'ADMIN' && user?.tenantId?.id) {
        req.user = user;
        req.tenantId = user?.tenantId?.id;
        next();
      } else if (user?.roleName === 'ADMIN') {
        req.user = user;
        next();
      } else {
        res
          .status(403)
          .json({ status: 403, message: 'You are not authorized!' });
      }
    } else {
      res.status(401).json({
        status: 401,
        message: 'Authorization header missing or invalid format!',
      });
    }
  } catch (error: any) {
    res.status(401).json({ status: 401, message: error.message });
  }
};

export const verifyTokenAndOwner = (
  req: any,
  res: Response,
  next: NextFunction,
): void => {
  try {
    verifyToken(req, res, () => {
      if (req.user.roleName === 'OWNER') {
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
      if (req.user.isAdmin && req.user.roleName === 'ADMIN') {
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
