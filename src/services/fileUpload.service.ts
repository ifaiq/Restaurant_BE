import { apiResponse } from './../types/res';
import { Request } from 'express';
import { fileUpload } from '../helper/fileUpload';
import { logger } from '../utils/logger';

export class uploadService {
  static async uploadFile(req: Request | any): Promise<apiResponse> {
    try {
      const uploadResult = await fileUpload(req);
      if (uploadResult.status !== 200) {
        return { status: 400, message: 'File upload failed' };
      }
      let filePath: string;
      let fileUrl: string;

      if ('s3UploadResult' in uploadResult) {
        filePath = uploadResult.s3UploadResult.key;
        fileUrl = process.env.AWS_BUCKET_URL + uploadResult.s3UploadResult.key;
      } else if ('Key' in uploadResult) {
        filePath = uploadResult.Key;
        fileUrl = process.env.AWS_BUCKET_URL + filePath;
        return {
          status: 200,
          message: 'File uploaded successfully',
          data: { filePath, fileUrl },
        };
      } else {
        throw new Error('Unexpected upload result format');
      }
      return {
        status: 200,
        message: 'File uploaded successfully',
        data: { URL: fileUrl },
      };
    } catch (error: any) {
      logger.log({
        level: 'error',
        message: error.message,
      });
      return { status: 500, message: error.message };
    }
  }
}
