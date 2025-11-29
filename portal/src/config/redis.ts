import dotenv from 'dotenv';
import { Redis } from 'ioredis';
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
      // Use console to avoid circular dependency with logger
      console.log(`Redis connected successfully (PID: ${process.pid})`);
    });

    redis.on('error', (err) => {
      // Use console to avoid circular dependency with logger
      console.error(`Redis connection error: ${err.message}`);
    });
  }
  return redis;
};
