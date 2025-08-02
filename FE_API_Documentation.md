# Inventory Management System – Complete API Reference for Frontend Development

---

## Table of Contents
- Authentication & Roles
- Dashboard
- Products Page
- Suppliers Page
- Warehouses & Locations Page
- Inventory (Stock) Page
- Purchase Orders Page
- Sales Orders Page
- Users & Roles Page (optional)
- Error Handling & Notifications
- Audit Log Page (optional)
- API Call Order & Dependency Map

---

## 1. Authentication & Roles

### Page: Login

**APIs Used:**
- `POST /api/token/` (on login form submission)

**Request:**
- Headers: `Content-Type: application/json`
- Payload:
  ```json
  {
    "username": "admin1", // string, required
    "password": "testpass" // string, required
  }
  ```

**Response:**
- Success:
  ```json
  {
    "access": "<jwt-token>", // string, JWT access token
    "refresh": "<refresh-token>" // string, JWT refresh token
  }
  ```
- Failure:
  ```json
  {
    "detail": "No active account found with the given credentials"
  }
  ```

**Usage:**
- On successful login, store `access` token in localStorage and use for all subsequent API calls in `Authorization: Bearer <token>` header.

**Dependencies:**
- None

---

## 2. Dashboard

### Page: Dashboard

**APIs Used:**
- `GET /api/products/?page=1&page_size=10` (on page load, for product stats)
- `GET /api/stock/?page=1&page_size=10` (on page load, for stock stats)
- `GET /api/purchase-orders/?page=1&page_size=10` (admin/manager, for order stats)
- `GET /api/sales-orders/?page=1&page_size=10` (all roles, for order stats)

**Request:**
- Headers: `Authorization: Bearer <access-token>`
- No payload (GET requests)

**Response:**
- Paginated list:
  ```json
  {
    "count": 40,
    "next": null,
    "previous": null,
    "results": [ ... ]
  }
  ```

**Usage:**
- Populate summary stats, tables, and paginated lists.

**Dependencies:**
- JWT token required

---

## 3. Products Page

### APIs Used:
- `GET /api/products/` (on page load, table population)
- `POST /api/products/` (on product creation form submit)
- `PATCH /api/products/{id}/` (on product edit form submit)
- `DELETE /api/products/{id}/` (on delete button click)
- `GET /api/categories/` (populate category dropdown)
- `GET /api/suppliers/` (populate supplier dropdown)
- `GET /api/warehouses/` (populate warehouse dropdown)

#### 1. List Products
- Endpoint: `GET /api/products/?page=1&page_size=10`
- Headers: `Authorization: Bearer <access-token>`
- Response: Paginated product list

#### 2. Create Product
- Endpoint: `POST /api/products/`
- Headers: `Authorization: Bearer <access-token>`, `Content-Type: application/json`
- Payload:
  ```json
  {
    "name": "Test Product", // string, required
    "sku": "SKU1000", // string, required, unique
    "barcode": "1234567890123", // string, required, unique
    "category": 1, // integer, required (category_id)
    "supplier": 1, // integer, required (supplier_id)
    "warehouse": 1, // integer, required (warehouse_id)
    "unit_price": 100, // number, required
    "price": 100 // number, required
  }
  ```
- Response:
  ```json
  {
    "id": 1,
    "name": "Test Product",
    "sku": "SKU1000",
    "barcode": "1234567890123",
    "category": 1,
    "supplier": 1,
    "warehouse": 1,
    "unit_price": 100,
    "price": 100
  }
  ```
- Failure (validation):
  ```json
  {
    "detail": "SKU must be unique"
  }
  ```

#### 3. Update Product
- Endpoint: `PATCH /api/products/{id}/`
- Headers: `Authorization: Bearer <access-token>`, `Content-Type: application/json`
- Payload: Only updatable fields, e.g.:
  ```json
  {
    "name": "Updated Product",
    "price": 150
  }
  ```
- Response: Updated product object

#### 4. Delete Product
- Endpoint: `DELETE /api/products/{id}/`
- Headers: `Authorization: Bearer <access-token>`
- Response: `204 No Content` on success

#### Dropdowns:
- Category: `GET /api/categories/` → use `id`, `name`
- Supplier: `GET /api/suppliers/` → use `id`, `name`
- Warehouse: `GET /api/warehouses/` → use `id`, `name`

**Dependencies:**
- Must create category, supplier, and warehouse first; use their IDs in product payload.

---

## 4. Suppliers Page

### APIs Used:
- `GET /api/suppliers/` (on page load, table population)
- `POST /api/suppliers/` (on create form submit)
- `DELETE /api/suppliers/{id}/` (on delete button click)

#### 1. List Suppliers
- Endpoint: `GET /api/suppliers/?page=1&page_size=10`
- Headers: `Authorization: Bearer <access-token>`
- Response: Paginated supplier list

#### 2. Create Supplier
- Endpoint: `POST /api/suppliers/`
- Headers: `Authorization: Bearer <access-token>`, `Content-Type: application/json`
- Payload:
  ```json
  {
    "name": "Test Supplier", // string, required
    "email": "supplier@example.com" // string, required, valid email
  }
  ```
- Response:
  ```json
  {
    "id": 1,
    "name": "Test Supplier",
    "email": "supplier@example.com"
  }
  ```

#### 3. Delete Supplier
- Endpoint: `DELETE /api/suppliers/{id}/`
- Headers: `Authorization: Bearer <access-token>`
- Response: `204 No Content` on success

**Dependencies:**
- None

---

## 5. Warehouses & Locations Page

### APIs Used:
- `GET /api/warehouses/` (on page load, table population)
- `POST /api/warehouses/` (on create form submit)
- `DELETE /api/warehouses/{id}/` (on delete button click)
- `GET /api/locations/` (populate location dropdown)
- `POST /api/locations/` (on create location form submit)
- `DELETE /api/locations/{id}/` (on delete button click)

#### 1. List Warehouses
- Endpoint: `GET /api/warehouses/?page=1&page_size=10`
- Headers: `Authorization: Bearer <access-token>`
- Response: Paginated warehouse list

#### 2. Create Warehouse
- Endpoint: `POST /api/warehouses/`
- Headers: `Authorization: Bearer <access-token>`, `Content-Type: application/json`
- Payload:
  ```json
  {
    "name": "Main Warehouse", // string, required
    "capacity": 1000, // integer, required
    "address": "123 Main St" // string, required
  }
  ```
- Response:
  ```json
  {
    "id": 1,
    "name": "Main Warehouse",
    "capacity": 1000,
    "address": "123 Main St"
  }
  ```

#### 3. Delete Warehouse
- Endpoint: `DELETE /api/warehouses/{id}/`
- Headers: `Authorization: Bearer <access-token>`
- Response: `204 No Content` on success

#### 4. Create Location
- Endpoint: `POST /api/locations/`
- Headers: `Authorization: Bearer <access-token>`, `Content-Type: application/json`
- Payload:
  ```json
  {
    "name": "Test Location", // string, required
    "warehouse": 1 // integer, required (warehouse_id)
  }
  ```
- Response:
  ```json
  {
    "id": 1,
    "name": "Test Location",
    "warehouse": 1
  }
  ```

#### 5. Delete Location
- Endpoint: `DELETE /api/locations/{id}/`
- Headers: `Authorization: Bearer <access-token>`
- Response: `204 No Content` on success

**Dependencies:**
- Must create warehouse first; use warehouse ID in location payload.

---

## 6. Inventory (Stock) Page

### APIs Used:
- `GET /api/stock/` (on page load, table population)
- `POST /api/stock/` (on create form submit)
- `DELETE /api/stock/{id}/` (on delete button click)
- `POST /api/stock-movements/` (on movement form submit)
- `POST /api/stock-adjustments/` (on adjustment form submit)
- `GET /api/products/` (populate product dropdown)
- `GET /api/warehouses/` (populate warehouse dropdown)
- `GET /api/locations/` (populate location dropdown)

#### 1. List Stock
- Endpoint: `GET /api/stock/?page=1&page_size=10`
- Headers: `Authorization: Bearer <access-token>`
- Response: Paginated stock list

#### 2. Create Stock
- Endpoint: `POST /api/stock/`
- Headers: `Authorization: Bearer <access-token>`, `Content-Type: application/json`
- Payload:
  ```json
  {
    "product": 1, // integer, required
    "warehouse": 1, // integer, required
    "location": 1, // integer, required
    "quantity": 100 // integer, required
  }
  ```
- Response:
  ```json
  {
    "id": 1,
    "product": 1,
    "warehouse": 1,
    "location": 1,
    "quantity": 100
  }
  ```

#### 3. Delete Stock
- Endpoint: `DELETE /api/stock/{id}/`
- Headers: `Authorization: Bearer <access-token>`
- Response: `204 No Content` on success

#### 4. Record Stock Movement
- Endpoint: `POST /api/stock-movements/`
- Headers: `Authorization: Bearer <access-token>`, `Content-Type: application/json`
- Payload:
  ```json
  {
    "stock": 1, // integer, required
    "movement_type": "IN", // string, required ("IN" or "OUT")
    "quantity": 10, // integer, required
    "reason": "Restock" // string, required
  }
  ```
- Response:
  ```json
  {
    "id": 1,
    "stock": 1,
    "movement_type": "IN",
    "quantity": 10,
    "reason": "Restock"
  }
  ```

#### 5. Adjust Stock
- Endpoint: `POST /api/stock-adjustments/`
- Headers: `Authorization: Bearer <access-token>`, `Content-Type: application/json`
- Payload:
  ```json
  {
    "stock": 1, // integer, required
    "adjustment_type": "ADD", // string, required ("ADD" or "REMOVE")
    "quantity": 5, // integer, required
    "reason": "Correction", // string, required
    "approved_by": 2 // integer, required (user ID of manager/admin)
  }
  ```
- Response:
  ```json
  {
    "id": 1,
    "stock": 1,
    "adjustment_type": "ADD",
    "quantity": 5,
    "reason": "Correction",
    "approved_by": 2
  }
  ```
- Failure (forbidden):
  ```json
  {
    "detail": "Only manager or admin can approve stock adjustments."
  }
  ```

**Dependencies:**
- Must create product, warehouse, location, and stock first; use their IDs in payloads.

---

## 7. Purchase Orders Page

### APIs Used:
- `GET /api/purchase-orders/` (on page load, table population)
- `POST /api/purchase-orders/` (on create form submit)
- `DELETE /api/purchase-orders/{id}/` (on delete button click)
- `POST /api/purchase-orders/{id}/receive/` (on receive button click)
- `GET /api/suppliers/` (populate supplier dropdown)
- `GET /api/products/` (populate product dropdown)

#### 1. List Purchase Orders
- Endpoint: `GET /api/purchase-orders/?page=1&page_size=10`
- Headers: `Authorization: Bearer <access-token>`
- Response: Paginated PO list

#### 2. Create Purchase Order
- Endpoint: `POST /api/purchase-orders/`
- Headers: `Authorization: Bearer <access-token>`, `Content-Type: application/json`
- Payload:
  ```json
  {
    "supplier": 1, // integer, required
    "status": "open", // string, required
    "items": [
      {
        "product": 1, // integer, required
        "quantity": 10, // integer, required
        "unit_price": 100 // number, required
      }
    ]
  }
  ```
- Response:
  ```json
  {
    "id": 1,
    "supplier": 1,
    "status": "open",
    "items": [
      {
        "product": 1,
        "quantity": 10,
        "unit_price": 100
      }
    ]
  }
  ```

#### 3. Delete Purchase Order
- Endpoint: `DELETE /api/purchase-orders/{id}/`
- Headers: `Authorization: Bearer <access-token>`
- Response: `204 No Content` on success

#### 4. Mark PO as Received
- Endpoint: `POST /api/purchase-orders/{id}/receive/`
- Headers: `Authorization: Bearer <access-token>`
- Response:
  ```json
  {
    "detail": "Stock incremented and PO marked as received"
  }
  ```

**Dependencies:**
- Must create supplier and product first; use their IDs in PO payload.

---

## 8. Sales Orders Page

### APIs Used:
- `GET /api/sales-orders/` (on page load, table population)
- `POST /api/sales-orders/` (on create form submit)
- `DELETE /api/sales-orders/{id}/` (on delete button click)
- `GET /api/customers/` (populate customer dropdown)
- `GET /api/products/` (populate product dropdown)

#### 1. List Sales Orders
- Endpoint: `GET /api/sales-orders/?page=1&page_size=10`
- Headers: `Authorization: Bearer <access-token>`
- Response: Paginated SO list

#### 2. Create Sales Order
- Endpoint: `POST /api/sales-orders/`
- Headers: `Authorization: Bearer <access-token>`, `Content-Type: application/json`
- Payload:
  ```json
  {
    "customer": 1, // integer, required
    "status": "open", // string, required
    "items": [
      {
        "product": 1, // integer, required
        "quantity": 2, // integer, required
        "unit_price": 100 // number, required
      }
    ]
  }
  ```
- Response (success):
  ```json
  {
    "id": 5,
    "customer": 1,
    "status": "open",
    "items": [
      {
        "product": 1,
        "quantity": 2,
        "unit_price": 100
      }
    ]
  }
  ```
- Failure (insufficient stock):
  ```json
  {
    "detail": "Stock not available",
    "errors": ["Stock not available for product 1. Requested: 2, Available: 0"]
  }
  ```

#### 3. Delete Sales Order
- Endpoint: `DELETE /api/sales-orders/{id}/`
- Headers: `Authorization: Bearer <access-token>`
- Response: `204 No Content` on success

**Dependencies:**
- Must create customer and product first; use their IDs in SO payload.

---

## 9. Users & Roles Page (optional)

### APIs Used:
- `GET /api/users/` (on page load, table population)
- `PATCH /api/users/{id}/` (on role assignment)

**Usage:**
- Only for admin; used to manage users and assign roles.

---

## 10. Error Handling & Notifications

### Edge Cases & Failure Responses
- 400 Bad Request: Validation or business rule violation (e.g., missing fields, insufficient stock)
- 403 Forbidden: Not enough permissions
- 401 Unauthorized: Not authenticated
- All error responses include a `detail` field and may include field-level errors.

**Frontend Logic:**
- Display error messages next to fields or in a global notification (e.g., Snackbar).
- Validate all forms before submit.
- Hide/disable restricted actions for unauthorized roles.

---

## 11. Audit Log Page (optional, advanced)

### APIs Used:
- `GET /api/audit-log/` (on page load, table population)

**Usage:**
- Show all critical actions (stock changes, order status changes).

---

## API Call Order & Dependency Map

**Sequence for FE Implementation:**
1. Create users and assign roles; obtain JWT token.
2. Create categories, suppliers, warehouses.
3. Create locations (requires warehouse ID).
4. Create products (requires supplier, category, warehouse IDs).
5. Create stock (requires product, warehouse, location IDs).
6. Create orders (requires supplier/product/customer IDs).
7. Record stock movements/adjustments (requires stock ID).

**Always use IDs from previous steps in dependent API calls.**

---

**This document provides exhaustive API details, request/response schemas, headers, dependencies, and page mapping for all frontend development needs.** If you need further breakdowns or sample payloads for any specific business scenario, let me know!
