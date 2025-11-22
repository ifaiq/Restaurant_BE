import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';
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
      logger.info(`User verification attempt: ${JSON.stringify(user)}`);
      if (user?.roleName !== 'ADMIN' && user?.tenantId?.id) {
        req.user = user;
        req.tenantId = user?.tenantId?.id;
        logger.info(
          `Token verified successfully for user: ${user.id}, role: ${user.roleName}, tenantId: ${user.tenantId.id}`,
        );
        next();
      } else if (user?.roleName === 'ADMIN') {
        req.user = user;
        logger.info(`Token verified successfully for admin user: ${user.id}`);
        next();
      } else {
        logger.warn(
          `Authorization failed - missing tenantId for user: ${user?.id}`,
        );
        res
          .status(403)
          .json({ status: 403, message: 'You are not authorized!' });
      }
    } else {
      logger.warn(
        'Token verification failed - Authorization header missing or invalid format',
      );
      res.status(401).json({
        status: 401,
        message: 'Authorization header missing or invalid format!',
      });
    }
  } catch (error: any) {
    logger.error(`Token verification error: ${error.message}`);
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
        logger.info(`Owner access granted for user: ${req.user.id}`);
        next();
      } else {
        logger.warn(
          `Owner access denied for user: ${req.user.id}, role: ${req.user.roleName}`,
        );
        res
          .status(401)
          .json({ status: 401, message: 'You are not authenticated!' });
      }
    });
  } catch (error: any) {
    logger.error(`verifyTokenAndOwner error: ${error.message}`);
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
        logger.info(`Admin access granted for user: ${req.user.id}`);
        next();
      } else {
        logger.warn(
          `Admin access denied for user: ${req.user.id}, role: ${req.user.roleName}, isAdmin: ${req.user.isAdmin}`,
        );
        res
          .status(401)
          .json({ status: 401, message: 'You are not authenticated!' });
      }
    });
  } catch (error: any) {
    logger.error(`verifyTokenAndAdmin error: ${error.message}`);
    res.status(401).json({ status: 401, message: error.message });
  }
};

export const verifyTokenAndEdit = (
  req: any,
  res: Response,
  next: NextFunction,
): void => {
  try {
    verifyToken(req, res, () => {
      if (req.user.roleName === 'OWNER' || req.user.roleName === 'ADMIN') {
        logger.info(
          `Edit access granted for user: ${req.user.id}, role: ${req.user.roleName}`,
        );
        next();
      } else {
        logger.warn(
          `Edit access denied for user: ${req.user.id}, role: ${req.user.roleName}`,
        );
        res
          .status(401)
          .json({ status: 401, message: 'You are not authenticated!' });
      }
    });
  } catch (error: any) {
    logger.error(`verifyTokenAndEdit error: ${error.message}`);
    res.status(401).json({ status: 401, message: error.message });
  }
};
