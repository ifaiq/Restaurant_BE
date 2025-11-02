import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { apiResponse } from '../types/res';
import { logger } from '../utils/logger';

export async function login(req: Request, res: Response): Promise<apiResponse> {
  try {
    const { status, ...data } = await AuthService.login(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.error(`Login controller error: ${error.message}`, {
      stack: error.stack,
    });
    return res.status(500).send({ error: error.message });
  }
}

export async function register(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await AuthService.register(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.error(`Register controller error: ${error.message}`, {
      stack: error.stack,
    });
    return res.status(500).send({ error: error.message });
  }
}

export async function forgetPassword(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await AuthService.forgetPassword(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.error(`ForgetPassword controller error: ${error.message}`, {
      stack: error.stack,
    });
    return res.status(500).send({ error: error.message });
  }
}

export async function forgetKeyPassword(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await AuthService.forgetKeyPassword(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.error(`ForgetKeyPassword controller error: ${error.message}`, {
      stack: error.stack,
    });
    return res.status(500).send({ error: error.message });
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await AuthService.passwordReset(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.error(`ResetPassword controller error: ${error.message}`, {
      stack: error.stack,
    });
    return res.status(500).send({ error: error.message });
  }
}

export async function passwordResetByToken(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await AuthService.passwordResetByToken(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.error(`PasswordResetByToken controller error: ${error.message}`, {
      stack: error.stack,
    });
    return res.status(500).send({ error: error.message });
  }
}

export async function resetPasswordByEmail(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await AuthService.passwordResetByEmail(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.error(`ResetPasswordByEmail controller error: ${error.message}`, {
      stack: error.stack,
    });
    return res.status(500).send({ error: error.message });
  }
}

export async function genTenantId(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await AuthService.genTenantId();
    return res.status(status).send(data);
  } catch (error: any) {
    logger.error(`GenTenantId controller error: ${error.message}`, {
      stack: error.stack,
    });
    return res.status(500).send({ error: error.message });
  }
}
