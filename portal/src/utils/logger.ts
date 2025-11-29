import { createLogger, format, transports } from 'winston';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { RedisTransport } from './redisLoggerTransport';

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
    format.errors({ stack: true }),
    format.json(),
    format.metadata(),
  ),
});

/**
 * Initialize Redis logger transport
 * Stores logs in Redis for efficient access and querying
 */
export const initializeRedisLogger = async () => {
  try {
    // Create Redis connection directly to avoid circular dependency
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      maxRetriesPerRequest: null,
      password: process.env.REDIS_PASSWORD,
    };

    const redisClient = new Redis(redisConfig);

    // Test Redis connection
    await redisClient.ping();

    // Add Redis transport to logger
    logger.add(
      new RedisTransport({
        redisClient,
        key: 'app:logs',
        maxLogs: parseInt(process.env.REDIS_LOG_MAX_ENTRIES || '1000', 10),
        ttl: process.env.REDIS_LOG_TTL
          ? parseInt(process.env.REDIS_LOG_TTL, 10)
          : undefined, // Optional: expire logs after TTL seconds (e.g., 7 days = 604800)
      }),
    );

    logger.info(`Redis logger initialized successfully (PID: ${process.pid})`);
  } catch (error: any) {
    logger.error(`Failed to initialize Redis logger: ${error.message}`);
    // Continue without Redis logging - console logging still works
  }
};
