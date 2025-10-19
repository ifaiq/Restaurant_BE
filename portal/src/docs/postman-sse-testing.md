# Testing SSE (Server-Sent Events) in Postman

This guide shows you how to test the real-time order updates using Postman's SSE capabilities.

## Prerequisites

1. **Postman Version**: You need Postman version 10.6.0 or later (SSE support was added recently)
2. **Authentication**: You need a valid JWT token for authentication
3. **Running Server**: Make sure your restaurant portal server is running

## Step 1: Get Authentication Token

First, you need to authenticate and get a JWT token:

### Login Request
```
POST http://localhost:3000/api/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Response:** Copy the token from the response, you'll need it for SSE authentication.

## Step 2: Test SSE Connection

### SSE Endpoint
```
GET http://localhost:3000/api/order/events
```

### Method 1: Using Postman's Native SSE Support

1. **Open Postman** and create a new request
2. **Set Method** to `GET`
3. **Enter URL**: `http://localhost:3000/api/order/events`
4. **Add Query Parameters** (optional):
   - `restaurantId`: `your-restaurant-id`
   - `status`: `PENDING`
   - `tableId`: `your-table-id`

5. **Go to Headers tab** and add:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN_HERE
   ```

6. **Click the "Send" dropdown** and select **"Server-Sent Events"** instead of regular Send

7. **Stream Response**: You should see a stream window that shows:
   ```
   event: connection
   data: {"type":"connection","data":{"connectionId":"sse_1_1704067200000","message":"Connected to order updates"},"timestamp":"2024-01-01T12:00:00.000Z"}
   ```

## Step 3: Trigger Events to Test

To see real events, you need to trigger order operations. Keep the SSE connection open and create a new tab for testing order operations:

### Create a Test Order
```
POST http://localhost:3000/api/order/create
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body:**
```json
{
  "restaurantId": "your-restaurant-id",
  "tableId": "your-table-id",
  "items": [
    {
      "id": "menu-item-id",
      "itemName": "Test Item",
      "quantity": 2,
      "unitPrice": 10.99,
      "totalPrice": 21.98
    }
  ],
  "paymentMethod": "CASH"
}
```

After creating this order, you should see an `ORDER_CREATED` event in your SSE stream:

```
event: ORDER_CREATED
data: {"type":"ORDER_CREATED","data":{"order":{"id":"uuid","orderNumber":"ORD-xxxxx",...},"message":"Order created: ORD-xxxxx"},"timestamp":"2024-01-01T12:00:00.000Z","filters":{"tenantId":"tenant-uuid","restaurantId":"restaurant-uuid",...}}
```

### Update Order Status
```
PUT http://localhost:3000/api/order/status/ORDER_ID_HERE
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body:**
```json
{
  "status": "CONFIRMED"
}
```

This should trigger an `ORDER_STATUS_UPDATED` event.

## Step 4: Testing Different Scenarios

### Test with Filters

1. **Restaurant Filter**: Add `?restaurantId=your-restaurant-id` to only get events for that restaurant
2. **Status Filter**: Add `?status=PENDING` to only get events for pending orders
3. **Table Filter**: Add `?tableId=your-table-id` to only get events for that table

Example URLs:
```
GET http://localhost:3000/api/order/events?restaurantId=123&status=PENDING
GET http://localhost:3000/api/order/events?tableId=456
GET http://localhost:3000/api/order/events?restaurantId=123&tableId=456&status=CONFIRMED
```

## Method 2: Alternative Testing (If SSE not supported)

If your Postman version doesn't support SSE, you can use this workaround:

### Using cURL in Terminal
```bash
curl -N -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: text/event-stream" \
  "http://localhost:3000/api/order/events?restaurantId=123"
```

### Using Browser
Open browser developer tools and run:
```javascript
const eventSource = new EventSource('http://localhost:3000/api/order/events?restaurantId=123', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

eventSource.onmessage = function(event) {
  console.log('Event:', JSON.parse(event.data));
};
```

## Expected Event Flow

When testing, you should see this sequence:

1. **Connection Event** (immediate):
   ```
   event: connection
   data: {...}
   ```

2. **Order Events** (when you perform operations):
   ```
   event: ORDER_CREATED
   data: {...}
   
   event: ORDER_STATUS_UPDATED  
   data: {...}
   
   event: ORDER_UPDATED
   data: {...}
   
   event: ORDER_PAYMENT_UPDATED
   data: {...}
   
   event: ORDER_DELETED
   data: {...}
   ```

## Troubleshooting

### Common Issues:

1. **Authentication Error**: Make sure your JWT token is valid and not expired
2. **No Events**: Ensure you're performing order operations that trigger events
3. **Connection Drops**: Check server logs for errors
4. **Filter Not Working**: Verify your query parameters match actual data

### Debug Tips:

1. Check server console for SSE connection logs
2. Verify your JWT token is being parsed correctly
3. Make sure you have proper permissions for the operations you're testing

## Testing Checklist

- [ ] SSE connection establishes successfully
- [ ] Authentication works with JWT token
- [ ] Connection event received immediately
- [ ] ORDER_CREATED event triggers when creating orders
- [ ] ORDER_STATUS_UPDATED event triggers when updating status
- [ ] ORDER_UPDATED event triggers when modifying orders
- [ ] ORDER_PAYMENT_UPDATED event triggers when updating payment
- [ ] Filters work correctly (restaurant, status, table)
- [ ] Connection handles errors gracefully
