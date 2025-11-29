import Transport from 'winston-transport';
import { Redis } from 'ioredis';

interface RedisLoggerOptions {
  redisClient: Redis; // Required - should be passed from logger initialization
  key?: string;
  maxLogs?: number;
  ttl?: number; // Time to live in seconds
  level?: string;
}

/**
 * Custom Winston transport for Redis
 * Stores logs in Redis using Lists (LPUSH) for efficient storage
 */
export class RedisTransport extends Transport {
  private redisClient: Redis;
  private key: string;
  private maxLogs: number;
  private ttl?: number;

  constructor(options: RedisLoggerOptions) {
    super(options);

    if (!options.redisClient) {
      throw new Error('Redis client is required for RedisTransport');
    }

    this.redisClient = options.redisClient;
    this.key = options.key || 'app:logs';
    this.maxLogs = options.maxLogs || 1000; // Keep last 1000 logs
    this.ttl = options.ttl; // Optional: expire logs after TTL seconds
  }

  log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const logEntry = {
      level: info.level,
      message: info.message,
      timestamp: info.timestamp || new Date().toISOString(),
      metadata: info.metadata || {},
      stack: info.stack,
      ...info,
    };

    const logString = JSON.stringify(logEntry);

    // Store log in Redis list
    this.redisClient
      .pipeline()
      .lpush(this.key, logString)
      .ltrim(this.key, 0, this.maxLogs - 1)
      .exec()
      .catch((err) => {
        // Silently fail to avoid breaking the application
        console.error('Redis logger error:', err.message);
      });

    // Set TTL if specified
    if (this.ttl) {
      this.redisClient.expire(this.key, this.ttl).catch((err) => {
        console.error('Redis logger TTL error:', err.message);
      });
    }

    callback();
  }
}
