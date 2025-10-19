# Server-Sent Events (SSE) for Orders

This document explains how to use the Server-Sent Events (SSE) endpoint for real-time order updates.

## Endpoint

```
GET /api/order/events
```

**Authentication**: Requires valid JWT token in the Authorization header.

## Query Parameters

- `restaurantId` (optional): Filter events for specific restaurant
- `status` (optional): Filter events by order status (PENDING, CONFIRMED, PREPARING, READY, SERVED, COMPLETED, CANCELLED, REFUNDED)
- `tableId` (optional): Filter events for specific table

## Event Types

The SSE connection will receive the following event types:

1. **connection**: Initial connection confirmation
2. **ORDER_CREATED**: When a new order is created
3. **ORDER_UPDATED**: When an order is modified
4. **ORDER_STATUS_UPDATED**: When order status changes
5. **ORDER_PAYMENT_UPDATED**: When payment status changes
6. **ORDER_DELETED**: When an order is deleted

## Event Format

```javascript
{
  type: "ORDER_CREATED", // Event type
  data: {
    order: {
      // Complete order object with relations
      id: "uuid",
      orderNumber: "ORD-xxxxx",
      status: "PENDING",
      paymentStatus: "PENDING",
      restaurant: { ... },
      table: { ... },
      items: [ ... ],
      // ... other order fields
    },
    message: "Order created: ORD-xxxxx"
  },
  timestamp: "2024-01-01T12:00:00.000Z",
  filters: {
    tenantId: "tenant-uuid",
    restaurantId: "restaurant-uuid",
    tableId: "table-uuid",
    status: "PENDING"
  }
}
```

## Client-Side Usage

```javascript
// Connect to SSE endpoint
const eventSource = new EventSource('/api/order/events?restaurantId=restaurant-123', {
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
});

// Listen for different event types
eventSource.addEventListener('connection', (event) => {
  const data = JSON.parse(event.data);
  console.log('Connected:', data);
});

eventSource.addEventListener('ORDER_CREATED', (event) => {
  const eventData = JSON.parse(event.data);
  console.log('New order created:', eventData.data.order);
  // Update UI to show new order
});

eventSource.addEventListener('ORDER_STATUS_UPDATED', (event) => {
  const eventData = JSON.parse(event.data);
  console.log('Order status updated:', eventData.data.order);
  // Update UI to reflect new status
});

eventSource.addEventListener('ORDER_PAYMENT_UPDATED', (event) => {
  const eventData = JSON.parse(event.data);
  console.log('Payment status updated:', eventData.data.order);
  // Update UI to reflect payment changes
});

eventSource.addEventListener('ORDER_UPDATED', (event) => {
  const eventData = JSON.parse(event.data);
  console.log('Order updated:', eventData.data.order);
  // Refresh order details in UI
});

eventSource.addEventListener('ORDER_DELETED', (event) => {
  const eventData = JSON.parse(event.data);
  console.log('Order deleted:', eventData.data.order);
  // Remove order from UI
});

// Error handling
eventSource.onerror = (error) => {
  console.error('SSE connection error:', error);
  // Implement reconnection logic if needed
};

// Close connection when done
// eventSource.close();
```

## React Hook Example

```javascript
import { useEffect, useState } from 'react';

function useOrderEvents(restaurantId, token) {
  const [orders, setOrders] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const url = `/api/order/events${restaurantId ? `?restaurantId=${restaurantId}` : ''}`;
    
    const eventSource = new EventSource(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.addEventListener('ORDER_CREATED', (event) => {
      const eventData = JSON.parse(event.data);
      setOrders(prev => [eventData.data.order, ...prev]);
    });

    eventSource.addEventListener('ORDER_STATUS_UPDATED', (event) => {
      const eventData = JSON.parse(event.data);
      setOrders(prev => 
        prev.map(order => 
          order.id === eventData.data.order.id ? eventData.data.order : order
        )
      );
    });

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [restaurantId, token]);

  return { orders, isConnected };
}

export default useOrderEvents;
```

## Features

- **Multi-tenant Support**: Events are filtered by tenant to ensure data isolation
- **Flexible Filtering**: Support for filtering by restaurant, table, and order status
- **Automatic Reconnection**: Built-in error handling and connection management
- **Connection Timeouts**: Automatic cleanup after 24 hours to prevent resource leaks
- **Real-time Updates**: Immediate notification for all order-related changes

## Security

- All SSE connections require valid JWT authentication
- Tenant isolation ensures users only receive events for their tenant's data
- Events are filtered based on user permissions and requested filters
