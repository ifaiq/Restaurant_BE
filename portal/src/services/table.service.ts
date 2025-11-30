import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { Table } from '../entity/Table';
import { AppDataSource } from '../config/database';
import { ILike } from 'typeorm';
import { generateTableQRCode } from '../helper/qrCode';

export class TableService {
  private static tableRepo = AppDataSource.getRepository(Table);

  static async createTable(req: Request | any): Promise<apiResponse> {
    try {
      const { tableNumber, restaurantId, seatingCapacity } = req.body;

      if (!restaurantId) {
        return {
          status: 400,
          message: 'Restaurant ID is required',
        };
      }
      if (!tableNumber || !seatingCapacity) {
        return {
          status: 400,
          message: 'Table number and seating capacity are required',
        };
      }

      if (
        typeof tableNumber !== 'number' ||
        tableNumber < 1 ||
        tableNumber > 10000
      ) {
        return {
          status: 400,
          message: 'Table number must be a number between 1 and 10000',
        };
      }
      if (
        typeof seatingCapacity !== 'number' ||
        seatingCapacity < 1 ||
        seatingCapacity > 20
      ) {
        return {
          status: 400,
          message: 'Seating capacity must be a number between 1 and 20',
        };
      }

      const existingTable = await this.tableRepo.findOneBy({
        tableNumber,
        restaurant: { id: restaurantId },
      });

      if (existingTable) {
        return {
          status: 400,
          message: 'Table with this number already exists for this restaurant!',
        };
      }

      const restaurant = await AppDataSource.getRepository(
        'Restaurant',
      ).findOne({
        where: { id: restaurantId },
        relations: ['tenantId'],
      });

      if (!restaurant) {
        return {
          status: 400,
          message: 'Restaurant not found or does not belong to tenant!',
        };
      }

      // Create table first to get the table ID
      let table = this.tableRepo.create({
        tableNumber,
        seatingCapacity,
        restaurant: { id: restaurantId },
        tenantId: { id: restaurant.tenantId?.id },
      });

      table = await this.tableRepo.save(table);
      if (!table) {
        return { status: 400, message: 'Unable to create table' };
      }

      // Generate QR code URL and image
      const { qrCodeUrl, qrCodeImage } = await generateTableQRCode(
        restaurantId,
        table.id,
      );

      // Update table with QR code URL and image
      table.qrCode = qrCodeUrl;
      table.qrCodeImage = qrCodeImage;
      table = await this.tableRepo.save(table);

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
      const { id, restaurantId } = req.params;
      const restaurant = await AppDataSource.getRepository(
        'Restaurant',
      ).findOneBy({
        id: restaurantId,
      });

      const table = await this.tableRepo.findOneBy({
        id: id,
        tenantId: restaurant?.tenantId,
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
        whereCondition.restaurant = { id: restaurantId };
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
        id: restaurantId,
        tenantId,
      });

      if (!restaurant) {
        return { status: 400, message: 'Restaurant not found!' };
      }

      const [tables, total] = await this.tableRepo.findAndCount({
        where: {
          restaurant: { id: restaurantId },
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

  static async updateTable(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const { tableNumber, status, seatingCapacity } = req.body;
      const tenantId = req?.tenantId;

      // Validate table number if provided
      if (tableNumber !== undefined) {
        if (
          typeof tableNumber !== 'number' ||
          tableNumber < 1 ||
          tableNumber > 10000
        ) {
          return {
            status: 400,
            message: 'Table number must be a number between 1 and 10000',
          };
        }
      }

      // Validate seating capacity if provided
      if (seatingCapacity !== undefined) {
        if (
          typeof seatingCapacity !== 'number' ||
          seatingCapacity < 1 ||
          seatingCapacity > 20
        ) {
          return {
            status: 400,
            message: 'Seating capacity must be a number between 1 and 20',
          };
        }
      }

      let table = await this.tableRepo.findOne({
        where: {
          id: id,
          tenantId: {
            id: tenantId,
          },
        },
        relations: ['restaurant'],
      });

      if (!table) {
        return { status: 400, message: 'Table not found!' };
      }

      table.tableNumber = tableNumber ? tableNumber : table.tableNumber;
      table.status = status ? status : table.status;
      table.seatingCapacity = seatingCapacity
        ? seatingCapacity
        : table.seatingCapacity;

      // Check if QR code or QR code image is missing, generate if needed
      if (!table.qrCode || !table.qrCodeImage) {
        const { qrCodeUrl, qrCodeImage } = await generateTableQRCode(
          table.restaurant.id,
          table.id,
        );
        table.qrCode = qrCodeUrl;
        table.qrCodeImage = qrCodeImage;
      }

      table = await this.tableRepo.save(table);

      return {
        status: 200,
        message: 'Table updated successfully!',
        data: table,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async updateTableStatus(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const tenantId = req?.tenantId;

      let table = await this.tableRepo.findOne({
        where: {
          id: id,
          tenantId: {
            id: tenantId,
          },
        },
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
        id: id,
        tenantId,
      });

      if (!table) {
        return { status: 400, message: 'Table not found!' };
      }

      await this.tableRepo.delete({ id: id });

      return { status: 200, message: 'Table deleted successfully!' };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async generateQRCode(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;

      const table = await this.tableRepo.findOne({
        where: {
          id: id,
          tenantId: {
            id: tenantId,
          },
        },
        relations: ['restaurant'],
      });

      if (!table) {
        return { status: 400, message: 'Table not found!' };
      }

      // Generate QR code URL and image
      const { qrCodeUrl, qrCodeImage } = await generateTableQRCode(
        table.restaurant.id,
        table.id,
      );

      // Update table with QR code URL and image
      table.qrCode = qrCodeUrl;
      table.qrCodeImage = qrCodeImage;
      await this.tableRepo.save(table);

      return {
        status: 200,
        message: 'QR code generated successfully!',
        data: {
          tableId: table.id,
          tableNumber: table.tableNumber,
          qrCodeUrl: qrCodeUrl,
          qrCodeImage: qrCodeImage,
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async regenerateQRCode(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;

      const table = await this.tableRepo.findOne({
        where: {
          id: id,
          tenantId,
        },
        relations: ['restaurant'],
      });

      if (!table) {
        return { status: 400, message: 'Table not found!' };
      }

      // Generate QR code URL and image
      const { qrCodeUrl, qrCodeImage } = await generateTableQRCode(
        table.restaurant.id,
        table.id,
      );

      // Update table with new QR code URL and image
      table.qrCode = qrCodeUrl;
      table.qrCodeImage = qrCodeImage;
      await this.tableRepo.save(table);

      return {
        status: 200,
        message: 'QR code regenerated successfully!',
        data: {
          tableId: table.id,
          tableNumber: table.tableNumber,
          qrCodeUrl: qrCodeUrl,
          qrCodeImage: qrCodeImage,
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }
}
