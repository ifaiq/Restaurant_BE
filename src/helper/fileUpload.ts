import dotenv from 'dotenv';
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import path from 'path';
import { logger } from '../utils/logger';
import { apiResponse } from '../types/res';

dotenv.config({ path: '../.env' });

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

if (!accessKeyId) {
  throw new Error('AWS access key is not defined');
}
if (!secretAccessKey) {
  throw new Error('AWS secret key is not defined');
}

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder where the files will be stored temporarily
  },
  filename: (req, file, cb) => {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const uploadFileToS3 = async (file: Express.Multer.File) => {
  try {
    const fileStream = fs.createReadStream(file.path);
    const uploadParams = {
      Bucket: bucketName,
      Body: fileStream,
      Key: `${file.filename}`,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    // Delete file from local storage after successful upload
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error(`Error deleting file: ${err}`);
      } else {
      }
    });

    return { message: 'File uploaded successfully', ...uploadParams };
  } catch (error: any) {
    return { message: `File upload failed: ${error.message}` };
  }
};

const uploadBufferToS3 = async (
  buffer: any,
  filename: string,
  mimetype: string,
) => {
  try {
    const uploadParams = {
      Bucket: bucketName,
      Body: buffer,
      Key: filename,
      ContentType: mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    return {
      message: 'Buffer uploaded successfully',
      fileUrl: `https://${bucketName}.s3.amazonaws.com/${filename}`,
      key: filename,
    };
  } catch (error: any) {
    return { message: `Upload failed: ${error.message}` };
  }
};

const fileUpload = async (req: Request | any) => {
  const uploadResult = await new Promise<{
    s3UploadResult: any;
    status: number;
    message?: string;
  }>((resolve, reject) => {
    upload.single('documentFile')(req, {} as any, (err: any) => {
      if (err) reject({ status: 400, message: err.message });
      resolve({ status: 200, s3UploadResult: null });
    });
  });

  if (uploadResult.status !== 200) {
    return uploadResult;
  }

  const uploadedFile = req?.file;
  const s3UploadResult = await uploadFileToS3(uploadedFile);
  if (!s3UploadResult || s3UploadResult.message.includes('failed')) {
    return { status: 500, message: 'Error Uploading File' };
  }
  return { status: 200, ...s3UploadResult };
};

const uploadFileToS3Path = async (filePath: string): Promise<apiResponse> => {
  try {
    const file = fs.readFileSync(path.resolve(__dirname, filePath));
    const uploadParams = {
      Bucket: bucketName,
      Body: file,
      Key: `AI-${path.basename(filePath)}`,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    return {
      status: 200,
      message: `${process.env.AWS_BUCKET_URL + uploadParams.Key}`,
      ...uploadParams,
    };
  } catch (error: any) {
    logger.log({
      level: 'error',
      message: `Error uploading file to S3: ${error.message}`,
    });
    return { message: 'Error uploading file to S3' };
  }
};

export { fileUpload, uploadFileToS3Path, uploadBufferToS3 };
