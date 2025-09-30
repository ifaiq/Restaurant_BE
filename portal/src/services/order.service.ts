import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { Order, OrderStatus, PaymentStatus } from '../entity/Order';
import { AppDataSource } from '../config/database';
import { User } from '../entity/User';
import { ILike, Between } from 'typeorm';

export class OrderService {
  private static orderRepo = AppDataSource.getRepository(Order);
  private static userRepo = AppDataSource.getRepository(User);

  private static generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  }

  static async createOrder(req: Request | any): Promise<apiResponse> {
    try {
      const {
        restaurantId,
        menuId,
        tableId,
        items,
        specialInstructions,
        paymentMethod,
      } = req.body;
      const menuData = await AppDataSource.getRepository('Menu').findOneBy({
        id: menuId,
        restaurantId: { id: restaurantId },
      });
      if (!menuData) {
        return {
          status: 400,
          message: 'Menu not found!',
        };
      }

      const restaurant = await AppDataSource.getRepository(
        'Restaurant',
      ).findOneBy({
        id: restaurantId,
      });

      if (!restaurant) {
        return {
          status: 400,
          message: 'Restaurant not found or does not belong to tenant!',
        };
      }

      let table = null;
      if (tableId) {
        table = await AppDataSource.getRepository('Table').findOneBy({
          id: tableId,
          restaurant: { id: restaurantId },
        });

        if (!table) {
          return {
            status: 400,
            message: 'Table not found or does not belong to restaurant!',
          };
        }
      }
      if (restaurant?.tenantId?.id !== menuData?.tenantId?.id) {
        return {
          status: 400,
          message: 'Restaurant and menu do not belong to the same tenant!',
        };
      }
      let subtotal = 0;
      items.forEach((item: any) => {
        let itemTotal = item.unitPrice * item.quantity;
        if (item.modifiers) {
          item.modifiers.forEach((modifier: any) => {
            itemTotal += modifier.price * item.quantity;
          });
        }
        item.totalPrice = itemTotal;
        subtotal += itemTotal;
      });

      // const taxRate = 0.08; // 8% tax rate - should be configurable
      // const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal;

      const orderNumber = this.generateOrderNumber();

      let order = this.orderRepo.create({
        orderNumber,
        restaurant,
        table: tableId ? tableId : undefined,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod,
        subtotal,
        totalAmount,
        items,
        specialInstructions,
        tenantId: restaurant?.tenantId,
      });

      order = await this.orderRepo.save(order);
      if (!order) {
        return { status: 400, message: 'Unable to create order' };
      }

      return {
        status: 200,
        message: 'Order created successfully!',
        data: order,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getOrder(req: Request | any): Promise<apiResponse> {
    try {
      const { id, restaurantId } = req.params;
      const restaurant = await AppDataSource.getRepository(
        'Restaurant',
      ).findOneBy({
        id: restaurantId,
      });
      if (!restaurant) {
        return { status: 400, message: 'Restaurant not found!' };
      }
      const order = await this.orderRepo.findOne({
        where: {
          id: id,
          restaurant: { id: restaurantId },
          tenantId: { id: restaurant?.tenantId?.id },
        },
        relations: ['tenantId', 'restaurant', 'table', 'deletedBy'],
      });
      if (!order) {
        return { status: 400, message: 'Order not found!' };
      }
      return { status: 200, data: order };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getOrderByNumber(req: Request | any): Promise<apiResponse> {
    try {
      const { orderNumber } = req.params;
      const tenantId = req?.tenantId;
      const order = await this.orderRepo.findOneBy({
        orderNumber,
        tenantId,
      });
      if (!order) {
        return { status: 400, message: 'Order not found!' };
      }
      return { status: 200, data: order };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getAllOrders(req: Request | any): Promise<apiResponse> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const tenantId = req?.tenantId;
      const search = req.query.search as string;
      const restaurantId = req.query.restaurantId as string;
      const status = req.query.status as string;
      const paymentStatus = req.query.paymentStatus as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const whereCondition: any = {
        tenantId: {
          id: tenantId,
        },
      };

      if (search) {
        whereCondition.orderNumber = ILike(`%${search}%`);
      }

      if (restaurantId) {
        whereCondition.restaurant = { id: restaurantId };
      }

      if (status) {
        whereCondition.status = status;
      }

      if (paymentStatus) {
        whereCondition.paymentStatus = paymentStatus;
      }

      if (startDate && endDate) {
        whereCondition.createdAt = Between(
          new Date(startDate),
          new Date(endDate),
        );
      }

      const [orders, total] = await this.orderRepo.findAndCount({
        where: whereCondition,
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
        relations: ['tenantId', 'restaurant', 'table', 'deletedBy'],
      });

      const totalPages = Math.ceil(total / limit);

      return {
        status: 200,
        data: orders,
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

  static async getOrdersByRestaurant(req: Request | any): Promise<apiResponse> {
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

      const [orders, total] = await this.orderRepo.findAndCount({
        where: {
          restaurant: { id: restaurantId },
          tenantId: { id: tenantId },
        },
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
        relations: ['tenantId', 'restaurant', 'table', 'deletedBy'],
      });

      const totalPages = Math.ceil(total / limit);

      return {
        status: 200,
        data: orders,
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

  static async getOrdersByTable(req: Request | any): Promise<apiResponse> {
    try {
      const { tableId } = req.params;
      const tenantId = req?.tenantId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Verify table exists
      const table = await AppDataSource.getRepository('Table').findOneBy({
        id: tableId,
        tenantId,
      });

      if (!table) {
        return { status: 400, message: 'Table not found!' };
      }

      const [orders, total] = await this.orderRepo.findAndCount({
        where: {
          table: { id: tableId },
          tenantId: { id: tenantId },
        },
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
        relations: ['tenantId', 'restaurant', 'table', 'deletedBy'],
      });

      const totalPages = Math.ceil(total / limit);

      return {
        status: 200,
        data: orders,
        meta: {
          totalItems: total,
          totalPages,
          currentPage: page,
          table: {
            id: table.id,
            number: table.tableNumber,
          },
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async updateOrder(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const {
        items,
        specialInstructions,
        paymentMethod,
        tipAmount,
        discountAmount,
      } = req.body;
      const tenantId = req?.tenantId;

      let order = await this.orderRepo.findOneBy({
        id: id,
        tenantId,
      });

      if (!order) {
        return { status: 400, message: 'Order not found!' };
      }

      // Recalculate totals if items are updated
      if (items) {
        let subtotal = 0;
        items.forEach((item: any) => {
          let itemTotal = item.unitPrice * item.quantity;
          if (item.modifiers) {
            item.modifiers.forEach((modifier: any) => {
              itemTotal += modifier.price * item.quantity;
            });
          }
          item.totalPrice = itemTotal;
          subtotal += itemTotal;
        });

        const taxRate = 0.08;
        const taxAmount = subtotal * taxRate;
        const totalAmount =
          subtotal + taxAmount + (tipAmount || 0) - (discountAmount || 0);

        order.subtotal = subtotal;
        order.taxAmount = taxAmount;
        order.totalAmount = totalAmount;
        order.items = items;
      }
      order.specialInstructions = specialInstructions
        ? specialInstructions
        : order.specialInstructions;
      order.paymentMethod = paymentMethod ? paymentMethod : order.paymentMethod;
      order.tipAmount = tipAmount ? tipAmount : order.tipAmount;
      order.discountAmount = discountAmount
        ? discountAmount
        : order.discountAmount;

      order = await this.orderRepo.save(order);

      return {
        status: 200,
        message: 'Order updated successfully!',
        data: order,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async updateOrderStatus(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const tenantId = req?.tenantId;

      let order = await this.orderRepo.findOneBy({
        id: id,
        tenantId,
      });

      if (!order) {
        return { status: 400, message: 'Order not found!' };
      }

      order.status = status;

      order = await this.orderRepo.save(order);

      return {
        status: 200,
        message: 'Order status updated successfully!',
        data: order,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async updatePaymentStatus(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const { paymentStatus, paymentMethod } = req.body;
      const tenantId = req?.tenantId;

      let order = await this.orderRepo.findOneBy({
        id: id,
        tenantId,
      });

      if (!order) {
        return { status: 400, message: 'Order not found!' };
      }

      order.paymentStatus = paymentStatus;
      if (paymentMethod) {
        order.paymentMethod = paymentMethod;
      }

      order = await this.orderRepo.save(order);

      return {
        status: 200,
        message: 'Payment status updated successfully!',
        data: order,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async deleteOrder(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;
      const tenantId = req?.tenantId;
      const order = await this.orderRepo.findOneBy({
        id: id,
        tenantId,
      });

      if (!order) {
        return { status: 400, message: 'Order not found!' };
      }

      // Only allow deletion of pending or cancelled orders
      if (
        order.status !== OrderStatus.PENDING &&
        order.status !== OrderStatus.CANCELLED
      ) {
        return {
          status: 400,
          message: 'Only pending or cancelled orders can be deleted!',
        };
      }

      await this.orderRepo.delete({ id: id });

      return { status: 200, message: 'Order deleted successfully!' };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }
}
