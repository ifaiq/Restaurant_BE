import { createLogger, format, transports } from 'winston';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import 'winston-mongodb';

export const logger = createLogger({
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message }) => `${level}: ${message}`),
      ),
    }),
  ],
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.metadata(),
    format.prettyPrint(),
  ),
});

const url = process.env.MONGO_URI_LLM ?? '';

const client = new MongoClient(url);

export const initializeMongoLogger = async () => {
  await client.connect();

  const transportOptions = {
    db: url,
    collection: 'logs',
  };

  logger.add(new transports.MongoDB(transportOptions));
  logger.info(`Connected to logging database (PID: ${process.pid})`);
};
