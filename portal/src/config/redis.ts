import dotenv from 'dotenv';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
dotenv.config({ path: '../.env' });

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
  password: process.env.REDIS_PASSWORD,
};

let redis: Redis | null = null;

export const createRedisConnection = () => {
  if (!redis) {
    redis = new Redis(redisConfig);

    redis.on('connect', () => {
      logger.log({
        level: 'info',
        message: `Redis connected successfully (PID: ${process.pid})`,
      });
    });

    redis.on('error', (err) => {
      logger.log({
        level: 'info',
        message: `Redis connection error:, ${err.message}`,
      });
    });
  }
  return redis;
};
