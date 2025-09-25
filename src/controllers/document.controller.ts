import { Request, Response } from 'express';
import { DocumentService } from '../services/document.service';
import { apiResponse } from '../types/res';
import { logger } from '../utils/logger';

export async function createDocument(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await DocumentService.createDocument(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.log({
      level: 'error',
      message: error.message,
    });
    return res.status(500).send({ error: error.message });
  }
}

export async function documentWebhook(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await DocumentService.documentWebhook(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.log({
      level: 'error',
      message: error.message,
    });
    return res.status(500).send({ error: error.message });
  }
}

export async function getDocuments(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await DocumentService.getDocuments(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.log({
      level: 'error',
      message: error.message,
    });
    return res.status(500).send({ error: error.message });
  }
}

export async function getDocumentById(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await DocumentService.getDocumentById(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.log({
      level: 'error',
      message: error.message,
    });
    return res.status(500).send({ error: error.message });
  }
}

export async function updateDocument(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await DocumentService.updateDocument(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.log({
      level: 'error',
      message: error.message,
    });
    return res.status(500).send({ error: error.message });
  }
}

export async function deleteDocument(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await DocumentService.deleteDocument(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.log({
      level: 'error',
      message: error.message,
    });
    return res.status(500).send({ error: error.message });
  }
}

export async function changeDocumentStatus(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } =
      await DocumentService.changeDocumentApprovalStatus(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.log({
      level: 'error',
      message: error.message,
    });
    return res.status(500).send({ error: error.message });
  }
}

export async function publishDocument(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await DocumentService.publishDocument(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.log({
      level: 'error',
      message: error.message,
    });
    return res.status(500).send({ error: error.message });
  }
}

export async function attachAIFriendlyDoc(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await DocumentService.attachAIFriendlyDoc(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.log({
      level: 'error',
      message: error.message,
    });
    return res.status(500).send({ error: error.message });
  }
}

export async function documentAnalytics(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await DocumentService.documentAnalytics(req);
    return res.status(status).send(data);
  } catch (error: any) {
    logger.log({
      level: 'error',
      message: error.message,
    });
    return res.status(500).send({ error: error.message });
  }
}

export async function getDocumentName(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await DocumentService.getDocumentName(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function uploadListDocument(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await DocumentService.uploadListDocument(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}
