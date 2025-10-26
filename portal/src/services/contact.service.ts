import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { AppDataSource } from '../config/database';
import { Contact } from '../entity/Contact';
import { ILike } from 'typeorm';

export class ContactService {
  private static contactRepo = AppDataSource.getRepository(Contact);

  static async createContact(req: Request | any): Promise<apiResponse> {
    try {
      const { name, email, phone, message, subject } = req.body;

      // Validate required fields
      if (!name || !email || !message) {
        return {
          status: 400,
          message: 'Name, email, and message are required',
        };
      }

      // Create new contact
      const contact = this.contactRepo.create({
        name,
        email,
        phone,
        message,
        subject,
        isRead: false,
        isDeleted: false,
      });

      const savedContact = await this.contactRepo.save(contact);

      return {
        status: 201,
        message: 'Contact form submitted successfully!',
        data: savedContact,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getAllContacts(req: Request | any): Promise<apiResponse> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const isRead = req.query.isRead as string;

      const where: any = {
        isDeleted: false,
      };

      if (search) {
        where.name = ILike(`%${search}%`);
      }

      if (isRead === 'true' || isRead === 'false') {
        where.isRead = isRead === 'true';
      }

      const [contacts, total] = await this.contactRepo.findAndCount({
        where,
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      return {
        status: 200,
        data: contacts,
        meta: {
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getContactById(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;

      const contact = await this.contactRepo.findOne({
        where: { id, isDeleted: false },
      });

      if (!contact) {
        return {
          status: 404,
          message: 'Contact not found',
        };
      }

      return {
        status: 200,
        data: contact,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async markAsRead(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;

      const contact = await this.contactRepo.findOne({
        where: { id, isDeleted: false },
      });

      if (!contact) {
        return {
          status: 404,
          message: 'Contact not found',
        };
      }

      contact.isRead = true;
      contact.updatedAt = new Date();

      await this.contactRepo.save(contact);

      return {
        status: 200,
        message: 'Contact marked as read',
        data: contact,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async markAsUnread(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;

      const contact = await this.contactRepo.findOne({
        where: { id, isDeleted: false },
      });

      if (!contact) {
        return {
          status: 404,
          message: 'Contact not found',
        };
      }

      contact.isRead = false;
      contact.updatedAt = new Date();

      await this.contactRepo.save(contact);

      return {
        status: 200,
        message: 'Contact marked as unread',
        data: contact,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async deleteContact(req: Request | any): Promise<apiResponse> {
    try {
      const { id } = req.params;

      const contact = await this.contactRepo.findOne({
        where: { id, isDeleted: false },
      });

      if (!contact) {
        return {
          status: 404,
          message: 'Contact not found',
        };
      }

      contact.isDeleted = true;
      contact.updatedAt = new Date();

      await this.contactRepo.save(contact);

      return {
        status: 200,
        message: 'Contact deleted successfully',
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getContactStats(): Promise<apiResponse> {
    try {
      const totalContacts = await this.contactRepo.count({
        where: { isDeleted: false },
      });

      const unreadContacts = await this.contactRepo.count({
        where: { isDeleted: false, isRead: false },
      });

      const readContacts = await this.contactRepo.count({
        where: { isDeleted: false, isRead: true },
      });

      return {
        status: 200,
        data: {
          total: totalContacts,
          unread: unreadContacts,
          read: readContacts,
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }
}
