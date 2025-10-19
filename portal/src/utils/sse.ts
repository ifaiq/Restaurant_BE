import { Response } from 'express';
import { User } from '../entity/User';

export interface SSEConnection {
  id: string;
  response: Response;
  userId?: string;
  tenantId?: string;
  restaurantId?: string;
  filters?: {
    status?: string;
    restaurantId?: string;
    tableId?: string;
  };
}

export interface SSEEvent {
  type: string;
  data: any;
  timestamp: Date;
  filters?: {
    tenantId?: string;
    restaurantId?: string;
    tableId?: string;
    status?: string;
  };
}

export class SSEManager {
  private static connections: Map<string, SSEConnection> = new Map();
  private static connectionCounter = 0;

  static addConnection(
    response: Response,
    user?: User,
    restaurantId?: string,
    filters?: { status?: string; restaurantId?: string; tableId?: string },
  ): string {
    const connectionId = `sse_${++this.connectionCounter}_${Date.now()}`;

    // Set SSE headers
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control, Authorization',
      'Access-Control-Allow-Methods': 'GET',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    });

    // Send initial connection event
    this.sendEvent(response, {
      type: 'connection',
      data: { connectionId, message: 'Connected to order updates' },
      timestamp: new Date(),
    });

    // Store connection
    const connection: SSEConnection = {
      id: connectionId,
      response,
      userId: user?.id,
      tenantId: user?.tenantId?.id,
      restaurantId: restaurantId || user?.restaurantId?.id,
      filters,
    };

    this.connections.set(connectionId, connection);

    // Set up keep-alive mechanism for Postman compatibility
    const keepAliveInterval = setInterval(() => {
      try {
        response.write(': keep-alive\n\n');
      } catch {
        clearInterval(keepAliveInterval);
        this.removeConnection(connectionId);
      }
    }, 30000); // Send keep-alive every 30 seconds

    // Handle client disconnect
    response.on('close', () => {
      clearInterval(keepAliveInterval);
      this.removeConnection(connectionId);
    });

    response.on('error', () => {
      clearInterval(keepAliveInterval);
      this.removeConnection(connectionId);
    });

    // Store the interval for cleanup
    (connection as any).keepAliveInterval = keepAliveInterval;

    return connectionId;
  }

  static removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      // Clear keep-alive interval if it exists
      const keepAliveInterval = (connection as any).keepAliveInterval;
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
      }

      try {
        connection.response.end();
      } catch (error: any) {
        // Connection might already be closed
        console.error('Error closing connection:', error.message);
      }
      this.connections.delete(connectionId);
    }
  }

  static sendEvent(response: Response, event: SSEEvent): void {
    try {
      const eventData = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
      response.write(eventData);
    } catch (error) {
      console.error('Error sending SSE event:', error);
    }
  }

  static broadcastOrderEvent(event: SSEEvent): void {
    const connectionsToNotify = Array.from(this.connections.values());

    connectionsToNotify.forEach((connection) => {
      try {
        // Check if this connection should receive this event
        if (this.shouldNotifyConnection(connection, event)) {
          this.sendEvent(connection.response, event);
        }
      } catch (error) {
        console.error(
          `Error broadcasting to connection ${connection.id}:`,
          error,
        );
        this.removeConnection(connection.id);
      }
    });
  }

  private static shouldNotifyConnection(
    connection: SSEConnection,
    event: SSEEvent,
  ): boolean {
    // Always notify if no filters are specified
    if (!connection.filters && !event.filters) {
      return true;
    }

    // Check tenant match (required)
    if (connection.tenantId && event.filters?.tenantId) {
      if (connection.tenantId !== event.filters.tenantId) {
        return false;
      }
    }

    // Check restaurant filter
    if (connection.filters?.restaurantId && event.filters?.restaurantId) {
      if (connection.filters.restaurantId !== event.filters.restaurantId) {
        return false;
      }
    }

    // Check table filter
    if (connection.filters?.tableId && event.filters?.tableId) {
      if (connection.filters.tableId !== event.filters.tableId) {
        return false;
      }
    }

    // Check status filter
    if (connection.filters?.status && event.filters?.status) {
      if (connection.filters.status !== event.filters.status) {
        return false;
      }
    }

    return true;
  }

  static getConnectionCount(): number {
    return this.connections.size;
  }

  static getConnectionsForTenant(tenantId: string): SSEConnection[] {
    return Array.from(this.connections.values()).filter(
      (conn) => conn.tenantId === tenantId,
    );
  }

  static getConnectionsForRestaurant(restaurantId: string): SSEConnection[] {
    return Array.from(this.connections.values()).filter(
      (conn) => conn.restaurantId === restaurantId,
    );
  }

  // Clean up any stale connections (optional periodic cleanup)
  static cleanup(): void {
    const staleConnections: string[] = [];

    this.connections.forEach((connection, connectionId) => {
      if (connection.response.destroyed) {
        staleConnections.push(connectionId);
      }
    });

    staleConnections.forEach((connectionId) => {
      this.removeConnection(connectionId);
    });
  }
}
