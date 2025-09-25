import express, { Request, Response } from 'express';
import { connectDB } from './config/database';
import morgan from 'morgan';
import SSERouter from './routes/sse.route';
import authRouter from './routes/auth.route';
import roleRouter from './routes/roles.route';
import userRouter from './routes/users.route';
import companyRouter from './routes/company.route';
import documentTypeRouter from './routes/documentType.route';
import groupRouter from './routes/groups.route';
import documentRouter from './routes/document.route';
import departmentRouter from './routes/department.route';
import uploadRouter from './routes/uploadFile.route';
import approvalRouter from './routes/approval.route';
import feedbackRouter from './routes/feedback.route';
import clientRouter from './routes/client.route';
import invoiceRouter from './routes/invoice.route';
import webhookRouter from './routes/webhook.route';
import privateDocumentRouter from './routes/privateDocument.route';
import ticketRouter from './routes/ticket.route';
import supporttRouter from './routes/userSupport.route';
import companyConfigRouter from './routes/companyConfig.route';
import helmet from 'helmet';

import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { initializeMongoLogger, logger } from './utils/logger';
import { EmailQueueExecutor } from './queues/executor/emailQueue.executor';
import { setupGracefulShutdown } from './queues/consumer';

const emailWorker = new EmailQueueExecutor();
setupGracefulShutdown([emailWorker]);
connectDB();
initializeMongoLogger();
const app = express();

app.use(SSERouter);

app.use(helmet());

app.disable('x-powered-by');
const allowedExact = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:3005',
];

function isAllowedOrigin(origin: string | URL) {
  if (!origin) return false;

  try {
    const url = new URL(origin);

    if (
      url.hostname === 'localhost' &&
      allowedExact.includes(
        typeof origin === 'string' ? origin : origin.toString(),
      )
    ) {
      return true;
    }
    if (
      url.protocol === 'https:' &&
      (url.hostname === 'nerdybuddy.com' ||
        url.hostname.endsWith('.nerdybuddy.com'))
    ) {
      return true;
    }

    return false;
  } catch (e: any) {
    logger.error(`CORS: Invalid origin format - ${e.message}`);
    return false;
  }
}

const corsOptions = {
  origin: (
    origin: any,
    callback: (arg0: Error | null, arg1: boolean | undefined) => any,
  ) => {
    if (!origin) {
      return callback(null, true);
    }

    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS: Origin not allowed'), false);
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(morgan('dev'));

app.use('/api/auth', authRouter);
app.use('/api/roles', roleRouter);
app.use('/api/users', userRouter);
app.use('/api/companies', companyRouter);
app.use('/api/document-type', documentTypeRouter);
app.use('/api/groups', groupRouter);
app.use('/api/documents', documentRouter);
app.use('/api/privateDocuments', privateDocumentRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/approval', approvalRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/client', clientRouter);
app.use('/api/invoice', invoiceRouter);
app.use('/api/webhook', webhookRouter);
app.use('/api/ticket', ticketRouter);
app.use('/api/support', supporttRouter);
app.use('/api/companyConfig', companyConfigRouter);

app.get('/', (req: Request, res: Response) => {
  res.status(404).send('Nobody’s home.💀');
});

const PORT = process.env.PORTAL_PORT || 3000;
app.listen(PORT, () => {
  logger.log({
    level: 'info',
    message: `Portal backend is running on port ${PORT} (PID: ${process.pid})`,
  });
});
