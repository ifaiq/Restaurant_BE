import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { apiResponse } from '../types/res';
import { SSEManager } from '../utils/sse';

export async function createOrder(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await OrderService.createOrder(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getOrder(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await OrderService.getOrder(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getOrderByNumber(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await OrderService.getOrderByNumber(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getAllOrders(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await OrderService.getAllOrders(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getOrdersByRestaurant(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await OrderService.getOrdersByRestaurant(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function getOrdersByTable(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await OrderService.getOrdersByTable(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function updateOrder(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await OrderService.updateOrder(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function updateOrderStatus(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await OrderService.updateOrderStatus(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function updatePaymentStatus(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await OrderService.updatePaymentStatus(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

export async function deleteOrder(
  req: Request,
  res: Response,
): Promise<apiResponse> {
  try {
    const { status, ...data } = await OrderService.deleteOrder(req);
    return res.status(status).send(data);
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
}

// SSE endpoint for real-time order updates
export async function subscribeToOrderUpdates(
  req: Request | any,
  res: Response,
): Promise<void> {
  try {
    const { restaurantId, status, tableId } = req.query;
    const user = req.user;

    const filters = {
      ...(status && { status }),
      ...(restaurantId && { restaurantId }),
      ...(tableId && { tableId }),
    };

    // Add this connection to the SSE manager
    const connectionId = SSEManager.addConnection(
      res,
      user,
      restaurantId,
      filters,
    );

    console.log(
      `SSE connection established for user ${user?.id} - connection: ${connectionId}`,
    );

    // Set a timeout to prevent hanging connections (optional)
    setTimeout(
      () => {
        SSEManager.removeConnection(connectionId);
      },
      24 * 60 * 60 * 1000,
    ); // 24 hours
  } catch (error: any) {
    console.error('SSE subscription error:', error);
    res.status(500).end();
  }
}
