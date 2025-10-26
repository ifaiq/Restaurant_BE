import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { logger } from '../utils/logger';
import { Tenant } from '../entity/Tenant';
import { Restaurant } from '../entity/Restaurant';
import { Menu } from '../entity/Menu';
import { Table } from '../entity/Table';
import { Order } from '../entity/Order';
import { Category } from '../entity/Category';
import { MenuItem } from '../entity/MenuItem';
import { Modifier } from '../entity/Modifiers';
import { MenuItemModifier } from '../entity/MenuItemModifier';
import { Contact } from '../entity/Contact';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_NAME,
  entities: [
    User,
    Tenant,
    Restaurant,
    Menu,
    Table,
    Order,
    Category,
    MenuItem,
    Modifier,
    MenuItemModifier,
    Contact,
  ],
  synchronize: true,
  // Connection pooling configuration
  extra: {
    // Maximum number of connections in the pool
    max: parseInt(process.env.DB_POOL_MAX || '40'),
    // Minimum number of connections in the pool
    min: parseInt(process.env.DB_POOL_MIN || '5'),
    // Maximum time (in milliseconds) that a connection can be idle before being closed
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
    // Maximum time (in milliseconds) to wait for a connection to be established
    connectionTimeoutMillis: parseInt(
      process.env.DB_POOL_CONNECTION_TIMEOUT || '20000',
    ),
    // Maximum time (in milliseconds) to wait for a query to complete
    queryTimeoutMillis: parseInt(process.env.DB_POOL_QUERY_TIMEOUT || '60000'),
    // Maximum time (in milliseconds) to wait for acquiring a connection from the pool
    acquireTimeoutMillis: parseInt(
      process.env.DB_POOL_ACQUIRE_TIMEOUT || '60000',
    ),
    // Enable SSL if required
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  // Connection pool settings
  poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
  // Enable connection pooling
  poolErrorHandler: (err: Error) => {
    logger.error({
      level: 'error',
      message: `Database pool error: ${err.message}`,
    });
  },
});

export const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    logger.log({
      level: 'info',
      message: `PostgreSQL connected with connection pooling (PID: ${process.pid})`,
    });

    // Log connection pool status
    const poolConfig = AppDataSource.options.extra;
    logger.log({
      level: 'info',
      message: `Connection pool configured - Max: ${poolConfig?.max}, Min: ${poolConfig?.min}, Pool Size: ${AppDataSource.options.poolSize}`,
    });
  } catch (error: any) {
    logger.error({
      level: 'error',
      message: `Database connection failed: ${error.message}`,
    });
  }
};
