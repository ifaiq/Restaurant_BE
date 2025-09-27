import express, { Request, Response } from 'express';
import { connectDB } from './config/database';
import morgan from 'morgan';
import authRouter from './routes/auth.route';
import userRouter from './routes/users.route';
import uploadRouter from './routes/uploadFile.route';
import restaurantRouter from './routes/restaurant.route';
import helmet from 'helmet';

import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { initializeMongoLogger, logger } from './utils/logger';
// import { EmailQueueExecutor } from './queues/executor/emailQueue.executor';
// import { setupGracefulShutdown } from './queues/consumer';

// const emailWorker = new EmailQueueExecutor();
// setupGracefulShutdown([emailWorker]);
connectDB();
initializeMongoLogger();
const app = express();

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
app.use('/api/restaurant', restaurantRouter);
app.use('/api/users', userRouter);
app.use('/api/upload', uploadRouter);
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
