# Inventory Management System API Documentation

## Authentication

### Login
- **POST** `/api/auth/login`
- **Body**: `{ username: string, password: string }`
- **Response**: `{ access: string, user: { id: number, username: string, role: string } }`

### Register
- **POST** `/api/auth/register`
- **Body**: `{ username: string, password: string, role: string }`
- **Response**: `{ access: string, user: { id: number, username: string, role: string } }`

## Products

### List Products
- **GET** `/api/products`
- **Query Parameters**: 
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
  - `category`: number (optional)
  - `search`: string (optional)
- **Response**: `{ data: Product[], total: number, page: number, totalPages: number }`

### Get Product
- **GET** `/api/products/:id`
- **Response**: `Product`

### Create Product
- **POST** `/api/products`
- **Body**: 
```json
{
  "name": string,
  "sku": string,
  "barcode": string,
  "categoryId": number,
  "supplierId": number,
  "warehouseId": number,
  "unitPrice": number,
  "price": number
}
```
- **Response**: `Product`

### Update Product
- **PUT** `/api/products/:id`
- **Body**: Same as Create Product
- **Response**: `Product`

### Delete Product
- **DELETE** `/api/products/:id`
- **Response**: `{ success: true }`

## Stock Management

### Get Stock Levels
- **GET** `/api/stock`
- **Query Parameters**:
  - `productId`: number (optional)
  - `warehouseId`: number (optional)
  - `locationId`: number (optional)
- **Response**: `{ data: Stock[], total: number }`

### Adjust Stock
- **POST** `/api/stock/adjust`
- **Body**:
```json
{
  "stockId": number,
  "adjustmentType": "ADD" | "REMOVE",
  "quantity": number,
  "reason": string
}
```
- **Response**: `{ success: true, newQuantity: number }`

### Record Stock Movement
- **POST** `/api/stock/movement`
- **Body**:
```json
{
  "stockId": number,
  "movementType": "IN" | "OUT",
  "quantity": number,
  "reason": string
}
```
- **Response**: `StockMovement`

## Purchase Orders

### Create Purchase Order
- **POST** `/api/purchase-orders`
- **Body**:
```json
{
  "supplierId": number,
  "items": [
    {
      "productId": number,
      "quantity": number,
      "unitPrice": number
    }
  ]
}
```
- **Response**: `PurchaseOrder`

### Update Purchase Order Status
- **PUT** `/api/purchase-orders/:id/status`
- **Body**: `{ status: "open" | "received" | "cancelled" }`
- **Response**: `PurchaseOrder`

## Sales Orders

### Create Sales Order
- **POST** `/api/sales-orders`
- **Body**:
```json
{
  "customerId": number,
  "items": [
    {
      "productId": number,
      "quantity": number,
      "unitPrice": number
    }
  ]
}
```
- **Response**: `SalesOrder`

### Update Sales Order Status
- **PUT** `/api/sales-orders/:id/status`
- **Body**: `{ status: "open" | "completed" | "cancelled" }`
- **Response**: `SalesOrder`

## Data Models

### Product
```typescript
interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  categoryId: number;
  supplierId: number;
  warehouseId: number;
  unitPrice: number;
  price: number;
}
```

### Stock
```typescript
interface Stock {
  id: number;
  productId: number;
  warehouseId: number;
  locationId: number;
  quantity: number;
}
```

### PurchaseOrder
```typescript
interface PurchaseOrder {
  id: number;
  supplierId: number;
  status: string;
  createdAt: string;
  items: PurchaseOrderItem[];
}
```

### SalesOrder
```typescript
interface SalesOrder {
  id: number;
  customerId: number;
  status: string;
  createdAt: string;
  items: SalesOrderItem[];
}
```

## Error Handling

All API endpoints follow a consistent error response format:

```typescript
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: any;
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Authentication required or failed
- `FORBIDDEN`: User lacks required permissions
- `NOT_FOUND`: Requested resource not found
- `VALIDATION_ERROR`: Invalid input data
- `BUSINESS_RULE_VIOLATION`: Operation violates business rules
- `INTERNAL_ERROR`: Unexpected server error

## Authentication & Authorization

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

Role-based access control (RBAC) is implemented with the following roles:
- `admin`: Full access to all endpoints
- `manager`: Access to most operations except user management
- `user`: Limited to read operations and basic transactions

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per minute
- Other endpoints: 60 requests per minute per authenticated user

## Pagination

List endpoints support pagination with the following query parameters:
- `page`: Page number (1-based)
- `limit`: Items per page (default: 10, max: 100)

Response includes pagination metadata:
```json
{
  "data": [],
  "total": number,
  "page": number,
  "totalPages": number
}
```