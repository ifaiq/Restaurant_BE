import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { logger } from '../utils/logger';
import { Tenant } from '../entity/Tenant';
import { Restaurant } from '../entity/Restaurant';
import { Menu } from '../entity/Menu';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_NAME,
  entities: [User, Tenant, Restaurant, Menu],
  synchronize: true,
});

export const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    logger.log({
      level: 'info',
      message: `PostgreSQL connected (PID: ${process.pid})`,
    });
  } catch (error: any) {
    logger.error({
      level: 'error',
      message: `Portal backend is running on port ${error.message}`,
    });
  }
};
