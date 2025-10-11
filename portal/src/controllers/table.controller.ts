import { Request, Response } from 'express';
import { TableService } from '../services/table.service';
import { apiResponse } from '../types/res';

export async function createTable(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await TableService.createTable(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getTable(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await TableService.getTable(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getTableByQR(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await TableService.getTableByQR(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getAllTables(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await TableService.getAllTables(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getTablesByRestaurant(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await TableService.getTablesByRestaurant(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function updateTable(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await TableService.updateTable(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

// export async function updateTableStatus(
//   req: Request,
//   res: Response,
// ): Promise<apiResponse> {
//   try {
//     const { status, ...data } = await TableService.updateTableStatus(req);
//     return res.status(status).send(data);
//   } catch (error: any) {
//     return res.status(500).send({ error: error.message });
//   }
// }

// export async function regenerateQRCode(
//   req: Request,
//   res: Response,
// ): Promise<apiResponse> {
//   try {
//     const { status, ...data } = await TableService.regenerateQRCode(req);
//     return res.status(status).send(data);
//   } catch (error: any) {
//     return res.status(500).send({ error: error.message });
//   }
// }

export async function deleteTable(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await TableService.deleteTable(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}
