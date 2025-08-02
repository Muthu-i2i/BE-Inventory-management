## API Call Order & Dependency Map

When integrating with the Inventory API, many endpoints require IDs of related resources created in previous steps. The following call order and dependency map ensures all required objects exist before making dependent API calls:

### 1. User & Role Setup
- Create users and assign roles/groups (admin, manager, employee, customer).
- Obtain JWT token for authentication.

### 2. Category
- `POST /api/categories/` — Create category (needed for products).
  - Response: `{ "id": <category_id> }`

### 3. Supplier
- `POST /api/suppliers/` — Create supplier (needed for products).
  - Response: `{ "id": <supplier_id> }`

### 4. Warehouse
- `POST /api/warehouses/` — Create warehouse (needed for locations, products, stock).
  - Response: `{ "id": <warehouse_id> }`

### 5. Location
- `POST /api/locations/` — Create location (requires warehouse_id).
  - Payload: `{ "name": "Location Name", "warehouse": <warehouse_id> }`
  - Response: `{ "id": <location_id> }`

### 6. Product
- `POST /api/products/` — Create product (requires supplier_id, category_id, warehouse_id).
  - Payload: `{ "name": ..., "supplier": <supplier_id>, "category": <category_id>, "warehouse": <warehouse_id>, ... }`
  - Response: `{ "id": <product_id> }`

### 7. Stock
- `POST /api/stock/` — Create stock (requires product_id, warehouse_id, location_id).
  - Payload: `{ "product": <product_id>, "warehouse": <warehouse_id>, "location": <location_id>, "quantity": ... }`
  - Response: `{ "id": <stock_id> }`

### 8. Orders
- Purchase Order: `POST /api/purchase-orders/` (requires supplier_id, product_id)
- Sales Order: `POST /api/sales-orders/` (requires customer_id, product_id)

### 9. Stock Movements & Adjustments
- Stock Movement: `POST /api/stock-movements/` (requires stock_id)
- Stock Adjustment: `POST /api/stock-adjustments/` (requires stock_id, approved_by user ID)

**Tip:** Always create and store IDs from previous steps before making dependent API calls. Strict validation will reject requests with missing or invalid IDs.
# API Usage & Advanced Business Logic Documentation (Frontend Integration)

This document is a complete guide for frontend developers (including those new to FE) integrating with the Inventory Management System. It covers all API endpoints, required roles, advanced business rules, integration tips, and copy-paste-ready prompts for rapid React.js implementation using AI agents.

---


## Authentication & Roles
- **JWT Auth**: Obtain a token via `/api/token/` (POST: username, password). Use `Authorization: Bearer <token>` in all requests.
- **Roles**: `admin`, `manager`, `employee`, `customer` (see test users in sample data loader).
- **Strict Validation**: All payloads must match the required schema; missing/extra fields or invalid types will return a 400 error.
- **How to Implement in React.js:**
  - Use Axios interceptors to attach JWT to all requests.
  - Store token in localStorage; on login, save role for UI control.
  - Always validate payloads before sending to API.
  - Example prompt: "Generate a React.js login page that authenticates via `/api/token/`, stores JWT, and redirects to dashboard."

---


## API Endpoints & Permissions (with FE Prompts)

### Pagination
- All list endpoints now return paginated results (default: 10 per page). Use `?page=` and `?page_size=` query params.
- **Prompt:** "Implement paginated table/grid views for all list endpoints. Add page controls and show total count."

### Products
- `GET /api/products/` — List products (paginated, all roles)
- `POST /api/products/` — Create product (admin/manager, strict validation)
  - **Dependencies:** Requires valid `supplier`, `category`, and `warehouse` IDs in payload.
- `PUT/PATCH/DELETE /api/products/{id}/` — Update/delete (admin/manager, strict validation)
- **Prompt:** "Create a React.js Products page with paginated table, search/filter, and CRUD actions. Show/hide create/edit/delete buttons based on user role. Validate all fields before submit."

### Suppliers
- `GET /api/suppliers/` — List suppliers (paginated, all roles)
- `POST /api/suppliers/` — Create supplier (admin/manager, strict validation)
  - **Dependencies:** None (can be created independently).
- **Prompt:** "Build a Suppliers page with paginated list and create form. Validate supplier name and email."

### Warehouses & Locations
- `GET /api/warehouses/` — List warehouses (paginated, all roles)
- `POST /api/warehouses/` — Create warehouse (admin/manager, strict validation)
  - **Dependencies:** None (can be created independently).
- `POST /api/locations/` — Create location (requires warehouse ID)
  - **Dependencies:** Must provide valid `warehouse` ID in payload.
- **Prompt:** "Create a Warehouses page with paginated list and create forms, restricted to admin/manager. Validate capacity and address."

### Inventory (Stock)
- `GET /api/stock/` — List stock (paginated, all roles)
- `POST /api/stock/` — Create stock (admin/manager, strict validation)
  - **Dependencies:** Requires valid `product`, `warehouse`, and `location` IDs in payload.
- `POST /api/stock-movements/` — Record stock movement (admin/manager, strict validation)
  - **Dependencies:** Requires valid `stock` ID in payload.
- `POST /api/stock-adjustments/` — Adjust stock (admin/manager only for approval, strict validation)
  - **Dependencies:** Requires valid `stock` ID and `approved_by` user ID in payload.
- **Prompt:** "Build an Inventory page with paginated stock list, movement history, and adjustment requests. Only admin/manager can approve adjustments. Validate all fields."

### Orders
- `GET /api/purchase-orders/` — List purchase orders (paginated, admin/manager)
- `POST /api/purchase-orders/` — Create purchase order (admin/manager, strict validation)
  - **Dependencies:** Requires valid `supplier` and `product` IDs in `items` payload.
- `POST /api/purchase-orders/{id}/receive/` — Mark as received, increments stock (admin/manager)
- `GET /api/sales-orders/` — List sales orders (paginated, all roles)
- `POST /api/sales-orders/` — Create sales order (admin/manager/employee, strict validation)
  - **Dependencies:** Requires valid `customer` and `product` IDs in `items` payload.
- **Prompt:** "Create Purchase and Sales Orders pages with paginated lists, forms, status display, and receive/fulfill actions. Validate stock on sales and show error if insufficient."

---


## Advanced Business Logic & API Impacts (with FE Integration Tips)


### Strict Payload Validation
- **Rule**: All API endpoints enforce strict validation (missing/extra fields, wrong types, invalid values).
- **API Impact**: 400 Bad Request with detailed error messages.
- **Frontend**: Validate all forms before submit; show field-level errors.
- **Prompt:** "Add client-side validation to all forms. Display API validation errors next to fields."

### Pagination
- **Rule**: All list endpoints are paginated.
- **API Impact**: Paginated response with `count`, `next`, `previous`, and `results`.
- **Frontend**: Add pagination controls and show total count.
- **Prompt:** "Implement paginated table/grid views for all list endpoints."

### 1. Stock Validation on Sales
- **Rule**: Sales order cannot be created if stock is insufficient.
- **API Impact**: `POST /api/sales-orders/` returns 400 with error if not enough stock.
- **Frontend**: Show error to user, prevent overselling UI.
- **Prompt:** "Add error handling in Sales Order form to display API error for insufficient stock."


### 2. Automatic Stock Deduction
- **Rule**: When a sales order is created, stock is deducted automatically (FIFO by location).
- **API Impact**: `POST /api/sales-orders/` reduces stock for each product.
- **Frontend**: After order, update stock display.
- **Prompt:** "After successful sales order creation, refresh inventory data in UI."


### 3. Automatic Stock Increment on PO Receipt
- **Rule**: When a purchase order is marked as received, stock is incremented.
- **API Impact**: `POST /api/purchase-orders/{id}/receive/` increases stock for each item.
- **Frontend**: Provide a UI action to mark PO as received.
- **Prompt:** "Add a 'Receive' button to Purchase Orders page that calls the receive API and updates stock."


### 4. Stock Adjustment Approval Workflow
- **Rule**: Only managers/admins can approve stock adjustments.
- **API Impact**: `POST /api/stock-adjustments/` returns 403 if not manager/admin.
- **Frontend**: Show/hide approval UI based on user role.
- **Prompt:** "Show/hide stock adjustment approval controls based on user role in Inventory page."


### 5. Role-Based Restrictions
- **Rule**: Sensitive actions (create/update/delete) are restricted by role.
- **API Impact**: 403 Forbidden for unauthorized roles.
- **Frontend**: Hide/disable restricted actions in UI.
- **Prompt:** "Implement role-based UI controls to hide/disable restricted actions for unauthorized users."

---


## Error Handling (with FE Prompts)
- **400 Bad Request**: Validation or business rule violation (e.g., insufficient stock, invalid payload)
- **403 Forbidden**: Not enough permissions
- **401 Unauthorized**: Not authenticated
- **Frontend**: Display clear error messages to users. Show field-level validation errors.
- **Prompt:** "Add a global error notification system (e.g., Snackbar) to show API errors and business rule violations. Display validation errors next to fields."

---


## Integration Guide (Step-by-Step for React.js)
- **Login**: Use `/api/token/` to get JWT.
- **Attach Token**: `Authorization: Bearer <token>`
- **Handle Errors**: Check for 400/403/401 and show user-friendly messages. Display validation errors next to fields.
- **Pagination**: Handle paginated responses for all list endpoints.
- **Strict Validation**: Validate payloads before sending; handle API validation errors.
- **Business Logic Awareness**: Always check for business rule errors in responses.
- **Prompt:** "Generate a React.js integration guide for connecting to the inventory API, handling JWT, paginated responses, strict validation, and error states."

---


## Sample Data Loader & Demo Scenarios (for FE Testing)

The `load_sample_data.py` script now demonstrates:
- Creation of >40 realistic products, categories, suppliers, warehouses, and locations.
- Initial stock setup for all products in multiple locations.
- Sales order with insufficient stock (shows error handling for business logic).
- Valid sales order (shows automatic stock deduction).
- Purchase order receipt (shows automatic stock increment).
- Stock adjustment attempted by employee (should fail) and by manager (should succeed).
- Prints a summary of all created objects and their states for demo clarity.
- **All demo data is realistic and covers all roles and business scenarios.**

**Frontend/QA can use this script to quickly reset and demo all business logic scenarios.**

---


## Test Users (from sample data)
- Admin:    username=admin1    password=testpass
- Manager:  username=manager1  password=testpass
- Employee: username=employee1 password=testpass
- Customers: username=customer1 ... customer5 password=testpass

---


## Notes for Frontend Developers

## JWT Token Troubleshooting & Best Practices

If you encounter errors like:
```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [
    {
      "token_class": "AccessToken",
      "token_type": "access",
      "message": "Token has wrong type"
    }
  ],
  "status_code": 401
}
```
Follow these steps in all apps and tests:

1. Always use the `access` token (not `refresh`) in the `Authorization: Bearer <token>` header for API requests.
2. In Django unit tests, obtain a fresh access token via `/api/token/` before making authenticated requests:
   ```python
   from rest_framework.test import APIClient
   client = APIClient()
   response = client.post('/api/token/', {'username': 'admin1', 'password': 'testpass'}, format='json')
   token = response.data['access']
   client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
   # Now make authenticated requests
   ```
3. In React, after login, store and use the `access` token for all API calls. If you get a 401, refresh the token or prompt the user to log in again.
4. Never hardcode tokens; always generate fresh ones for tests and integration.
5. If using automated tests, add coverage for authentication flows and error handling.
6. Always validate payloads before sending; handle API validation errors and show user-friendly messages.

**Prompt:** "Add troubleshooting and best practices for JWT token usage, strict validation, and paginated responses in all apps and tests."

---


## Recommended Frontend Pages & UI Features (with Prompts)


### 1. Login Page
- **Purpose**: Authenticate users and obtain JWT token.
- **Fields**: Username, password.
- **Logic**: On success, store token and user role; on failure, show error.
- **Strict Validation**: Validate required fields before submit.
- **Prompt:** "Generate a React.js login page with JWT authentication, strict validation, and error handling."


### 2. Dashboard
- **Purpose**: Show summary of products, stock, orders, and user role.
- **Pagination**: Show paginated stats and lists.
- **Prompt:** "Create a dashboard page in React.js that displays summary stats, paginated lists, and role-based actions."


### 3. Products Page
- **List View**: Show paginated products, search/filter, view details.
- **Create/Edit**: Only for admin/manager; form for product details with strict validation.
- **Prompt:** "Build a products page with paginated table/grid, search/filter, and CRUD forms using Material-UI. Validate all fields before submit."


### 4. Suppliers Page
- **List View**: Show paginated suppliers, view products supplied.
- **Create/Edit**: Only for admin/manager; strict validation.
- **Prompt:** "Create a suppliers page with paginated list and create/edit forms. Validate all fields."


### 5. Warehouses & Locations Page
- **List View**: Show paginated warehouses and their locations.
- **Create/Edit**: Only for admin/manager; strict validation.
- **Prompt:** "Build a warehouses page with paginated list and create/edit forms. Validate all fields."


### 6. Inventory (Stock) Page
- **List View**: Show paginated stock records (product, location, quantity).
- **Stock Movements**: Show movement history for each product/location.
- **Stock Adjustments**: Form to request/approve adjustments (approval only for manager/admin, strict validation).
- **Logic**: Show/hide adjustment approval based on user role.
- **Prompt:** "Create an inventory page with paginated stock list, movement history, and adjustment approval workflow. Validate all fields."


### 7. Purchase Orders Page
- **List View**: Show paginated purchase orders, filter by status.
- **Create**: Form to create new PO (admin/manager, strict validation).
- **Receive**: Button to mark PO as received (increments stock, admin/manager only).
- **Details**: Show items, supplier, status.
- **Prompt:** "Build a purchase orders page with paginated list, create, and receive actions. Validate all fields."


### 8. Sales Orders Page
- **List View**: Show paginated sales orders, filter by status.
- **Create**: Form to create new sales order (admin/manager/employee, strict validation).
- **Details**: Show items, customer, status.
- **Logic**: On create, handle insufficient stock error and show message.
- **Prompt:** "Create a sales orders page with paginated list, create, and error handling for insufficient stock. Validate all fields."


### 9. Users & Roles Page (optional)
- **List View**: Show paginated users and their roles (admin only).
- **Logic**: Allow role management if required.
- **Prompt:** "Build a users and roles page for admin to manage users and assign roles."


### 10. Error Handling & Notifications
- **Display**: Show clear error messages for 400/401/403 and business rule violations. Show field-level validation errors.
- **Success**: Show confirmation for successful actions (order created, stock adjusted, etc).
- **Prompt:** "Add a notification system for errors, validation issues, and success messages in React.js."


### 11. Audit Log Page (optional, advanced)
- **List View**: Show all critical actions (stock changes, order status changes).
- **Prompt:** "Create an audit log page that lists all critical actions and allows filtering by user, entity, and date."

---


## Sample API Payloads & User Flows (for FE Copy-Paste)

### 1. Login
- **Request:**
```json
POST /api/token/
{
  "username": "admin1",
  "password": "testpass"
}
```
- **Response:**
```json
{
  "access": "<jwt-token>",
  "refresh": "<refresh-token>"
}
```
- **User Flow:** User enters credentials, receives token, and is redirected to dashboard.

### 2. Create Sales Order (with stock validation)
- **Request:**
```json
POST /api/sales-orders/
{
  "customer": 1,
  "created_by": 2,
  "status": "open",
  "items": [
    {"product": 1, "quantity": 2, "unit_price": 100}
  ]
}
```
- **Response (Success):**
```json
{
  "id": 5,
  "customer": 1,
  "created_by": 2,
  "status": "open",
  "items": [
    {"product": 1, "quantity": 2, "unit_price": 100}
  ]
}
```
- **Response (Insufficient Stock or Validation Error):**
```json
{
  "detail": "Stock not available",
  "errors": ["Stock not available for product 1. Requested: 2, Available: 0"]
}
```
- **User Flow:** User fills order form, submits, and sees success or error message. Validation errors will be returned for missing/invalid fields.

### 3. Mark Purchase Order as Received
- **Request:**
```json
POST /api/purchase-orders/1/receive/
```
- **Response:**
```json
{
  "detail": "Stock incremented and PO marked as received"
}
```
- **User Flow:** User clicks "Receive" on PO, stock is incremented, and PO status updates.

### 4. Stock Adjustment (Approval Workflow)
- **Request:**
```json
POST /api/stock-adjustments/
{
  "stock": 1,
  "adjustment_type": "ADD",
  "quantity": 5,
  "reason": "Correction",
  "approved_by": 2
}
```
- **Response (Success):**
```json
{
  "id": 3,
  "stock": 1,
  "adjustment_type": "ADD",
  "quantity": 5,
  "approved_by": 2
}
```
- **Response (Forbidden or Validation Error):**
```json
{
  "detail": "Only manager or admin can approve stock adjustments."
}
```
- **User Flow:** User submits adjustment; if not manager/admin, sees error. Validation errors will be returned for missing/invalid fields.

---


## UI Mockups (ASCII Art & Prompts)

### Login Page
```
+--------------------------+
|   Inventory Login        |
+--------------------------+
| Username: [___________]  |
| Password: [___________]  |
| [ Login ]                |
| [Error: Invalid creds]   |
| [Validation: Required]   |
+--------------------------+
```

### Dashboard
```
+-------------------------------+
| Dashboard                     |
+-------------------------------+
| [Products: 40] [Stock: 40]    |
| [Orders: 10]  [Role: Manager] |
+-------------------------------+
| [Products] [Stock] [Orders]   |
| [Suppliers] [Warehouses]      |
+-------------------------------+
| [Pagination Controls]         |
+-------------------------------+
```

### Products Page
```
+---------------------------------------------------+
| Products                                          |
+---------------------------------------------------+
| Name   | SKU   | Category   | Price | Actions      |
|--------|-------|------------|-------|--------------|
| Phone  | SKU1000| Smartphones| $100 | [Edit][Del]  |
| Laptop | SKU1001| Laptops    | $500 | [Edit][Del]  |
+---------------------------------------------------+
| [Add Product]                                     |
| [Pagination Controls]                             |
+---------------------------------------------------+
```

### Sales Order Form
```
+------------------------------------------+
| New Sales Order                          |
+------------------------------------------+
| Customer: [Customer1 v]                  |
| Items:                                   |
|  [Product v] [Qty: 2] [Unit Price: $100] |
| [Add Item]                               |
|                                          |
| [Submit]                                 |
| [Error: Stock not available]             |
| [Validation: Required]                   |
+------------------------------------------+
```

### Purchase Order List
```
+---------------------------------------------------+
| Purchase Orders                                   |
+---------------------------------------------------+
| Supplier | Status   | Items | Actions             |
|----------|----------|-------|---------------------|
| Tech Distributors | open | ... | [Receive]        |
| Global Electronics| received | ... |              |
+---------------------------------------------------+
| [Pagination Controls]                             |
+---------------------------------------------------+
```

---


## User Journey Diagrams (Textual & Prompts)

### 1. Create Sales Order (with validation)
```
[Login] → [Dashboard] → [Sales Orders] → [Add Sales Order]
   ↓
[Fill Form] → [Submit]
   ↓
[If stock OK] → [Order Created] → [Stock Deducted]
[If insufficient stock] → [Error Shown]
```

### 2. Receive Purchase Order
```
[Login as Manager/Admin] → [Dashboard] → [Purchase Orders]
   ↓
[Select PO] → [Click Receive]
   ↓
[Stock Incremented] → [PO Status: received]
```

### 3. Stock Adjustment Approval
```
[Login as Employee] → [Inventory] → [Adjust Stock]
   ↓
[Submit Adjustment]
   ↓
[Error: Only manager/admin can approve]

[Login as Manager/Admin] → [Inventory] → [Adjust Stock]
   ↓
[Submit Adjustment]
   ↓
[Adjustment Approved]
```

---


## Test Case Plan for Business Logic & Demo Scenarios (for FE Validation)

### 1. Authentication & Roles
- Test login with valid/invalid credentials.
- Test JWT-protected endpoint access for each role (admin, manager, employee, customer).

### 2. Products
- Test product creation (admin/manager, strict validation).
- Test product listing (paginated, all roles).
- Test product update/delete (admin/manager, strict validation).

### 3. Suppliers
- Test supplier creation (admin/manager, strict validation).
- Test supplier listing (paginated, all roles).

### 4. Warehouses & Locations
- Test warehouse/location creation (admin/manager, strict validation).
- Test warehouse/location listing (paginated, all roles).

### 5. Inventory (Stock)
- Test stock creation (admin/manager, strict validation).
- Test stock listing (paginated, all roles).
- Test stock movement creation (admin/manager, strict validation).
- Test stock adjustment creation (manager/admin approval required, strict validation).

### 6. Orders
#### Purchase Orders
- Test purchase order creation (admin/manager, strict validation).
- Test purchase order listing (paginated, admin/manager).
- Test marking purchase order as received (admin/manager) and verify stock increment.

#### Sales Orders
- Test sales order creation (admin/manager/employee, strict validation) with sufficient stock (should succeed, stock deducted).
- Test sales order creation with insufficient stock (should fail, error returned).
- Test sales order listing (paginated, all roles).

### 7. Stock Adjustment Approval Workflow
- Test stock adjustment approval as employee (should fail).
- Test stock adjustment approval as manager/admin (should succeed).

### 8. Role-Based Restrictions
- Test that restricted actions (e.g., product/stock/order creation) are forbidden for unauthorized roles.

### 9. Demo Data Loader
- Test that running the sample data loader script creates all expected objects and relationships, including >40 products and all roles.

---

**This plan covers all main business logic and demo scenarios. If you have tests for all the above, your system is well-validated for functional and demo purposes.**
