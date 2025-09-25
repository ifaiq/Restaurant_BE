import { Request, Response } from 'express';
import { apiResponse } from '../types/res';
import { logger } from '../utils/logger';
import { uploadService } from '../services/fileUpload.service';

export async function uploadFile(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await uploadService.uploadFile(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.log({
      level: 'error',
      message: error.message,
    });
    return res.status(500).send({ error: error.message });
  }
}
