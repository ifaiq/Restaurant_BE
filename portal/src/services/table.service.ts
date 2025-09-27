import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { Table } from '../entity/Table';
import { AppDataSource } from '../config/database';
import { User } from '../entity/User';
import { ILike } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class TableService {
  private static tableRepo = AppDataSource.getRepository(Table);
  private static userRepo = AppDataSource.getRepository(User);

  static async createTable(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      if (!tenantId) {
        return { status: 400, message: 'Tenant ID is required!' };
      }
      const { tableNumber, tableName, restaurantId } = req.body;

      // Check if table number already exists for this restaurant
      const existingTable = await this.tableRepo.findOneBy({
        tableNumber,
        restaurant: { id: restaurantId },
        tenantId,
      });

      if (existingTable) {
        return {
          status: 400,
          message: 'Table with this number already exists for this restaurant!',
        };
      }

      // Verify restaurant exists and belongs to tenant
      const restaurant = await AppDataSource.getRepository(
        'Restaurant',
      ).findOneBy({
        id: restaurantId,
        tenantId,
      });

      if (!restaurant) {
        return {
          status: 400,
          message: 'Restaurant not found or does not belong to tenant!',
        };
      }

      // Generate QR code data
      const qrCodeData = uuidv4();
      const qrCodeUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/menu/${restaurantId}?table=${tableNumber}&qr=${qrCodeData}`;

      let table = this.tableRepo.create({
        tableNumber,
        tableName,
        restaurant: { id: restaurantId },
        qrCode: qrCodeData,
        tenantId,
      });

      table = await this.tableRepo.save(table);
      if (!table) {
        return { status: 400, message: 'Unable to create table' };
      }

      return {
        status: 200,
        message: 'Table created successfully!',
        data: table,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getTable(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;
      const table = await this.tableRepo.findOneBy({
        id: Number(id),
        tenantId,
      });
      if (!table) {
        return { status: 400, message: 'Table not found!' };
      }
      return { status: 200, data: table };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getTableByQR(req: Request | any): Promise<apiResponse> {
    try {
      const { qrCode } = req.params;
      const table = await this.tableRepo.findOne({
        where: { qrCode },
        relations: ['restaurant'],
      });

      if (!table) {
        return { status: 400, message: 'Invalid QR code!' };
      }

      return { status: 200, data: table };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getAllTables(req: Request | any): Promise<apiResponse> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const tenantId = req?.tenantId;
      const search = req.query.search as string;
      const restaurantId = req.query.restaurantId as string;
      const status = req.query.status as string;
      const tableType = req.query.tableType as string;

      const whereCondition: any = {
        tenantId: {
          id: tenantId,
        },
      };

      if (search) {
        whereCondition.tableNumber = ILike(`%${search}%`);
      }

      if (restaurantId) {
        whereCondition.restaurant = { id: Number(restaurantId) };
      }

      if (status) {
        whereCondition.status = status;
      }

      if (tableType) {
        whereCondition.tableType = tableType;
      }

      const [tables, total] = await this.tableRepo.findAndCount({
        where: whereCondition,
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        status: 200,
        data: tables,
        meta: {
          totalItems: total,
          totalPages,
          currentPage: page,
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getTablesByRestaurant(req: Request | any): Promise<apiResponse> {
    try {
      const { restaurantId } = req.params;
      const tenantId = req?.tenantId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Verify restaurant exists
      const restaurant = await AppDataSource.getRepository(
        'Restaurant',
      ).findOneBy({
        id: Number(restaurantId),
        tenantId,
      });

      if (!restaurant) {
        return { status: 400, message: 'Restaurant not found!' };
      }

      const [tables, total] = await this.tableRepo.findAndCount({
        where: {
          restaurant: { id: Number(restaurantId) },
          tenantId,
        },
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        status: 200,
        data: tables,
        meta: {
          totalItems: total,
          totalPages,
          currentPage: page,
          restaurant: {
            id: restaurant.id,
            name: restaurant.restaurantName,
          },
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  // static async updateTable(req: Request | any): Promise<apiResponse> {
  //   try {
  //     const { id } = req.params;
  //     const {
  //       tableNumber,
  //       tableName,
  //       tableType,
  //       status,
  //       seatingCapacity,
  //       location,
  //       description,
  //       coordinates,
  //       features,
  //       isActive,
  //     } = req.body;
  //     const tenantId = req?.tenantId;

  //     let table = await this.tableRepo.findOneBy({
  //       id: Number(id),
  //       tenantId,
  //     });

  //     if (!table) {
  //       return { status: 400, message: 'Table not found!' };
  //     }

  //     table.tableNumber = tableNumber ? tableNumber : table.tableNumber;
  //     table.tableName = tableName ? tableName : table.tableName;
  //     table.tableType = tableType ? tableType : table.tableType;
  //     table.status = status ? status : table.status;
  //     table.seatingCapacity = seatingCapacity
  //       ? seatingCapacity
  //       : table.seatingCapacity;
  //     table.location = location ? location : table.location;
  //     table.description = description ? description : table.description;
  //     table.coordinates = coordinates ? coordinates : table.coordinates;
  //     table.features = features ? features : table.features;
  //     table.isActive = isActive ? isActive : table.isActive;

  //     table = await this.tableRepo.save(table);

  //     return {
  //       status: 200,
  //       message: 'Table updated successfully!',
  //       data: table,
  //     };
  //   } catch (error: any) {
  //     return { status: 500, error: error.message };
  //   }
  // }

  static async updateTableStatus(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const tenantId = req?.tenantId;

      let table = await this.tableRepo.findOneBy({
        id: Number(id),
        tenantId,
      });

      if (!table) {
        return { status: 400, message: 'Table not found!' };
      }

      table.status = status;
      table = await this.tableRepo.save(table);

      return {
        status: 200,
        message: 'Table status updated successfully!',
        data: table,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  // static async regenerateQRCode(req: Request | any): Promise<apiResponse> {
  //   try {
  //     const { id } = req.params;
  //     const tenantId = req?.tenantId;

  //     let table = await this.tableRepo.findOneBy({
  //       id: Number(id),
  //       tenantId,
  //     });

  //     if (!table) {
  //       return { status: 400, message: 'Table not found!' };
  //     }

  //     // Generate new QR code data
  //     const qrCodeData = uuidv4();
  //     const qrCodeUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/menu/${table.restaurant.id}?table=${table.tableNumber}&qr=${qrCodeData}`;

  //     table.qrCode = qrCodeData;
  //     table.qrCodeUrl = qrCodeUrl;
  //     table = await this.tableRepo.save(table);

  //     return {
  //       status: 200,
  //       message: 'QR code regenerated successfully!',
  //       data: table,
  //     };
  //   } catch (error: any) {
  //     return { status: 500, error: error.message };
  //   }
  // }

  static async deleteTable(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;
      const table = await this.tableRepo.findOneBy({
        id: Number(id),
        tenantId,
      });

      if (!table) {
        return { status: 400, message: 'Table not found!' };
      }

      await this.tableRepo.delete({ id: Number(id) });

      return { status: 200, message: 'Table deleted successfully!' };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }
}
