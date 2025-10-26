import { Request, Response } from 'express';
import { ContactService } from '../services/contact.service';
import { apiResponse } from '../types/res';

export async function createContact(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await ContactService.createContact(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getAllContacts(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await ContactService.getAllContacts(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getContactById(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await ContactService.getContactById(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function markAsRead(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await ContactService.markAsRead(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function markAsUnread(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await ContactService.markAsUnread(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function deleteContact(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await ContactService.deleteContact(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getContactStats(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await ContactService.getContactStats();
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}
