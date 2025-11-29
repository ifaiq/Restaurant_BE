import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

/**
 * Utility functions to retrieve logs from Redis
 */

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
  password: process.env.REDIS_PASSWORD,
};

/**
 * Get logs from Redis
 * @param limit Number of logs to retrieve (default: 100)
 * @param start Start index (default: 0)
 * @returns Array of log entries
 */
export const getLogs = async (
  limit: number = 100,
  start: number = 0,
): Promise<any[]> => {
  const redis = new Redis(redisConfig);
  const key = 'app:logs';

  try {
    // Get logs from Redis list (most recent first)
    const logs = await redis.lrange(key, start, start + limit - 1);

    // Parse JSON strings
    const parsedLogs = logs.map((log) => {
      try {
        return JSON.parse(log);
      } catch (e) {
        return { raw: e };
      }
    });

    return parsedLogs;
  } catch (error: any) {
    console.error('Error retrieving logs from Redis:', error.message);
    return [];
  } finally {
    redis.quit();
  }
};

/**
 * Get logs filtered by level
 * @param level Log level (error, warn, info, etc.)
 * @param limit Number of logs to retrieve
 * @returns Array of filtered log entries
 */
export const getLogsByLevel = async (
  level: string,
  limit: number = 100,
): Promise<any[]> => {
  const allLogs = await getLogs(limit * 10); // Get more logs to filter
  return allLogs.filter((log) => log.level === level).slice(0, limit);
};

/**
 * Get error logs only
 * @param limit Number of error logs to retrieve
 * @returns Array of error log entries
 */
export const getErrorLogs = async (limit: number = 100): Promise<any[]> => {
  return getLogsByLevel('error', limit);
};

/**
 * Get total number of logs stored
 * @returns Number of logs
 */
export const getLogCount = async (): Promise<number> => {
  const redis = new Redis(redisConfig);
  const key = 'app:logs';

  try {
    const count = await redis.llen(key);
    return count;
  } catch (error: any) {
    console.error('Error getting log count:', error.message);
    return 0;
  } finally {
    redis.quit();
  }
};

/**
 * Clear all logs from Redis
 * @returns Success status
 */
export const clearLogs = async (): Promise<boolean> => {
  const redis = new Redis(redisConfig);
  const key = 'app:logs';

  try {
    await redis.del(key);
    return true;
  } catch (error: any) {
    console.error('Error clearing logs:', error.message);
    return false;
  } finally {
    redis.quit();
  }
};
