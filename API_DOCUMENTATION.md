# Inventory Management System API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All API requests (except login and register) require the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### Login
```http
POST /auth/login
```
Request:
```json
{
  "username": "admin",
  "password": "admin123"
}
```
Response:
```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

#### Register
```http
POST /auth/register
```
Request:
```json
{
  "username": "manager1",
  "password": "manager123",
  "role": "manager"
}
```
Response:
```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 2,
    "username": "manager1",
    "role": "manager"
  }
}
```

### Products

#### List Products
```http
GET /products?page=1&page_size=10&search=laptop
```
Response:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Dell Laptop",
      "sku": "DELL-LAP-001",
      "barcode": "1234567890123",
      "categoryId": 1,
      "supplierId": 1,
      "warehouseId": 1,
      "unitPrice": 800,
      "price": 1200,
      "category": {
        "id": 1,
        "name": "Electronics"
      },
      "supplier": {
        "id": 1,
        "name": "Dell Inc"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "page_size": 10,
    "total_pages": 1
  }
}
```

#### Create Product
```http
POST /products
```
Request:
```json
{
  "name": "Dell Laptop",
  "sku": "DELL-LAP-001",
  "barcode": "1234567890123",
  "categoryId": 1,
  "supplierId": 1,
  "warehouseId": 1,
  "unitPrice": 800,
  "price": 1200
}
```

### Stock Management

#### Create Stock
```http
POST /stock
```
Request:
```json
{
  "productId": 1,
  "warehouseId": 1,
  "locationId": 1,
  "quantity": 100
}
```

#### Record Stock Movement
```http
POST /stock/:stockId/movements
```
Request:
```json
{
  "movementType": "IN",
  "quantity": 50,
  "reason": "Restock"
}
```

#### Adjust Stock
```http
POST /stock/:stockId/adjustments
```
Request:
```json
{
  "adjustmentType": "ADD",
  "quantity": 10,
  "reason": "Inventory count correction"
}
```

### Purchase Orders

#### Create Purchase Order
```http
POST /purchase-orders
```
Request:
```json
{
  "supplierId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 10,
      "unitPrice": 800
    }
  ]
}
```

#### Receive Purchase Order
```http
POST /purchase-orders/:id/receive
```
Response:
```json
{
  "id": 1,
  "status": "received",
  "items": [
    {
      "productId": 1,
      "quantity": 10,
      "unitPrice": 800
    }
  ]
}
```

### Sales Orders

#### Create Sales Order
```http
POST /sales-orders
```
Request:
```json
{
  "customerId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 1200
    }
  ]
}
```

#### Get Sales Statistics
```http
GET /sales-orders/stats?start_date=2023-01-01&end_date=2023-12-31
```
Response:
```json
{
  "totalSales": 25000,
  "orderCount": 20,
  "averageOrderValue": 1250,
  "topProducts": [
    {
      "productId": 1,
      "name": "Dell Laptop",
      "quantity": 15,
      "revenue": 18000
    }
  ]
}
```

### Reports

#### Inventory Value Report
```http
GET /reports/inventory-value
```
Response:
```json
{
  "totalValue": 150000,
  "valueByWarehouse": [
    {
      "warehouseId": 1,
      "warehouseName": "Main Warehouse",
      "totalValue": 100000
    }
  ]
}
```

#### Low Stock Report
```http
GET /reports/low-stock?threshold=10
```
Response:
```json
{
  "items": [
    {
      "productId": 1,
      "name": "Dell Laptop",
      "currentStock": 5,
      "threshold": 10,
      "warehouse": "Main Warehouse"
    }
  ]
}
```

## Error Responses

### Validation Error
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "quantity",
      "message": "Quantity must be greater than 0"
    }
  ]
}
```

### Authentication Error
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

### Authorization Error
```json
{
  "status": "error",
  "message": "Not authorized to access this resource"
}
```