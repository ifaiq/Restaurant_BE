import { AppDataSource } from '../config/database';
import { Ticket } from '../entity/Ticket';
import { TicketComment } from '../entity/TicketComment';

import { User } from '../entity/User';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export class TicketService {
  private static userRepo = AppDataSource.getRepository(User);
  private static ticketRepo = AppDataSource.getRepository(Ticket);
  private static commentRepo = AppDataSource.getRepository(TicketComment);

  static async createTicket(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      const user = req.user?.id;
      const userData = await this.userRepo.findOne({
        where: {
          id: user,
          tenantId: {
            id: tenantId,
          },
        },
      });
      if (!userData) {
        return {
          status: 400,
          message: 'User not found.',
        };
      }
      const { subject, description, priority, status } = req.body;
      if (!subject || !description) {
        return {
          status: 400,
          message: 'Subject and Description are required.',
        };
      }

      const newTicket = this.ticketRepo.create({
        subject,
        priority: priority || 'normal',
        description,
        user,
        tenantId,
        status,
      });

      const savedTicket = await this.ticketRepo.save(newTicket);
      if (!savedTicket) {
        return {
          status: 404,
          message: 'Unable to create a ticket',
        };
      }
      return {
        status: 200,
        data: savedTicket,
      };
    } catch (error: any) {
      return { status: 500, message: error?.message };
    }
  }

  static async getAllTickets(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req.tenantId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const [tickets, total] = await this.ticketRepo.findAndCount({
        where: { tenantId: { id: tenantId } },
        relations: ['user', 'responses', 'responses.user'],
        take: limit,
        skip: skip,
      });

      if (!tickets.length) {
        return { status: 404, message: 'No tickets found' };
      }

      return {
        status: 200,
        data: tickets,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      return {
        status: 500,
        message: error?.message,
      };
    }
  }

  static async getAllTicketsSuperAdmin(
    req: Request | any,
  ): Promise<apiResponse> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [tickets, total] = await this.ticketRepo.findAndCount({
        where: {},
        relations: ['user', 'responses', 'responses.user'],
        take: limit,
        skip: skip,
      });

      if (!tickets.length) {
        return { status: 404, message: 'No tickets found' };
      }

      return {
        status: 200,
        data: tickets,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      return {
        status: 500,
        message: error?.message,
      };
    }
  }

  static async getTicketComments(req: Request | any): Promise<apiResponse> {
    try {
      const ticketId = req.params.id;

      const data: any = await this.ticketRepo.findOne({
        where: {
          id: ticketId,
        },
        relations: ['responses', 'responses.user'],
      });
      if (!data) {
        return {
          status: 400,
          message: 'No ticket found',
        };
      }
      return {
        status: 200,
        data,
      };
    } catch (error: any) {
      return {
        status: 500,
        message: error.message,
      };
    }
  }

  static async updateTicket(req: Request | any): Promise<apiResponse> {
    try {
      const { message, status, priority } = req.body;
      const { id } = req.params;
      const tenantId = req?.tenantId;
      const user = req.user?.id;
      const userData = await this.userRepo.findOne({
        where: {
          id: user,
          tenantId: {
            id: tenantId,
          },
        },
      });
      if (!userData) {
        return {
          status: 400,
          message: 'User not found.',
        };
      }
      if (status || priority) {
        const ticketData = await this.ticketRepo.findOne({
          where: {
            id,
            tenantId: {
              id: tenantId,
            },
          },
        });

        if (!ticketData) {
          return {
            status: 400,
            message: 'Ticket not found',
          };
        }
        ticketData.status = status ? status : ticketData?.status;
        ticketData.priority = priority ? priority : ticketData?.priority;
        await this.ticketRepo.save(ticketData);
      }
      if (message) {
        let newResponse = this.commentRepo.create({
          user,
          ticket: id,
          tenantId,
          message,
        });
        newResponse = await this.commentRepo.save(newResponse);
        if (!newResponse) {
          return {
            status: 400,
            message: 'Unable to update ticket',
          };
        }
        return {
          status: 200,
          data: newResponse,
        };
      }
      return {
        status: 200,
        message: 'Ticket updated',
      };
    } catch (error: any) {
      return {
        status: 500,
        message: error?.message,
      };
    }
  }

  static async deleteTicket(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;

      const ticket = await this.ticketRepo.findOne({ where: { id } });
      if (!ticket) {
        return { status: 404, message: 'Ticket not found.' };
      }

      await this.ticketRepo.remove(ticket);
      return { status: 200, message: 'Deleted successfully' };
    } catch (error: any) {
      return { status: 500, message: error?.message };
    }
  }
}
