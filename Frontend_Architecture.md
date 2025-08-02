## Frontend Architecture Diagram and Detailed Design Document

Below is a curated architecture and design guide for your React-based Inventory Management System frontend. This document combines modern best practices, API integration specifics (per your docs), and modularity/scalability, in a form ready for developers, reviewers, and AI coding agents like Cursor.

### 1. **High-Level Architecture Diagram**

```
+---------------------------+
|       Browser/UI          |
|---------------------------|
|  React (SPA)              |
|  - React Router           |
|  - MUI/AntD Components    |
+---------------------------+
          |
          | Context/Reducer or Redux
          v
+---------------------------+
|   State Management Layer  |
| - Auth State/Context      |
| - Role-Based UI Logic     |
| - App Data State          |
+---------------------------+
          |
          | Axios Interceptor
          v
+---------------------------+
|    API Integration Layer  |
| - API Client (Axios)      |
| - JWT Handling            |
| - Data Fetching Hooks     |
+---------------------------+
          |
          v
+---------------------------+
|   Backend API (Django)    |
+---------------------------+
```

#### **Component Module Breakdown**

```
src/
  api/            # Axios setup, API methods
  auth/           # Login, AuthContext, hooks
  components/     # Generic widgets: Table, Modal, SnackBar
  features/       # Page modules: products/, suppliers/, orders/, inventory/
  context/        # App-wide Context (user, roles)
  pages/          # Route views: Dashboard, Products, etc.
  utils/          # Validation schemas, helpers
  App.js
  index.js
```

### 2. **Detailed Design: Feature-by-Feature**

#### **A. Authentication & User Management**

- **Components:**
  - `LoginPage.jsx` — Handles `/login` route, calls `/api/token/` POST.
  - `AuthContext.js` — Manages user info, JWT, role.
  - `ProtectedRoute.jsx` — Restricts app routes by role.
- **State & Hooks:**
  - Use `useContext` for auth; store tokens in localStorage.
  - Conditionally render UI based on `role` (admin, manager, etc).
- **Integration:**
  - Axios interceptor appends `Authorization: Bearer ` to all requests.
  - On error (401/403), show error and redirect as necessary.

#### **B. Global Layout, Navigation & Notification**

- **`App.js`:**
  - Declares all `Routes` via React Router.
  - Provides `AuthContext` and optional ThemeProvider.
- **UI Shell:**
  - AppBar (menu + logged-in user)
  - Sidebar (navigation, auto-hides for roles)
- **Global Snackbar/Notistack:**
  - Used for network errors, success, and role/business rule messages.

#### **C. Dashboard**

- **Components:**
  - Summary Cards: Total products, stock, POs, SOs, user role.
  - Recent Tables: Preview of latest records (paginated).
- **Hooks:**
  - Use separate hooks (`useProducts`, `useStocks`, etc.) to fetch first page for stats.
- **Integration:**
  - Serve as `home` after login, with role-based quick links.

#### **D. Products Feature Module**

- **Routes/Page:** `/products`
- **Components:**
  - `ProductTable.jsx` — Paginated, searchable, sortable.
  - `ProductForm.jsx` — Modal for create/edit (fields validated).
  - Dropdown fetch for `category`, `supplier`, `warehouse`.
- **Business Rules:**
  - Only admin/manager can create/edit/delete.
  - Link product to category, supplier, warehouse by live dropdown.
- **API Integration:**
  - `GET/POST/PATCH/DELETE /api/products/`
  - Validate: unique SKU/barcode, required fields, positive price.

#### **E. Suppliers Module**

- **Routes/Page:** `/suppliers`
- **Components:**
  - `SupplierTable.jsx` — Paginated.
  - `SupplierForm.jsx` — Modal/create (validated).
- **API Integration:**
  - `GET/POST/DELETE /api/suppliers/`
  - Fields: name, email (unique, valid format).

#### **F. Warehouses & Locations Module**

- **Routes/Page:** `/warehouses`
- **Components:**
  - `WarehouseTable.jsx`, `WarehouseForm.jsx`
  - `LocationForm.jsx` (create, needs warehouse ID)
- **Rules:**
  - Create warehouse before using in locations/products.
  - Validations for address, capacity (number).
- **API Integration:**
  - `GET/POST/DELETE /api/warehouses/` & `/api/locations/`

#### **G. Inventory Module**

- **Routes/Page:** `/inventory`
- **Components:**
  - `InventoryTable.jsx` — Paginated, searchable stock per warehouse/location.
  - `StockMovementForm.jsx`, `StockAdjustmentForm.jsx` (role-guarded approval).
- **Rules:**
  - Only admin/manager approve adjustments.
  - Movement and adjustment forms fetch valid stock IDs.
- **API Integration:**
  - `GET/POST/DELETE /api/stock/`
  - `POST /api/stock-movements/`
  - `POST /api/stock-adjustments/`

#### **H. Orders Module (PO/SO)**

- **Routes/Page:** `/purchase-orders`, `/sales-orders`
- **Components:**
  - `OrderTable.jsx` — Paginated, filter by status.
  - `OrderForm.jsx`, `ReceiveButton.jsx` (for POs)
- **Business Rules:**
  - Strict: cannot oversell (400 error on POST /sales-orders/)
  - After PO receive, refresh inventory.
- **API Integration:**
  - `GET/POST/DELETE /api/purchase-orders/` + `/sales-orders/`
  - `POST /api/purchase-orders/{id}/receive/`

#### **I. Reporting Dashboard (Charts + Audit Logs)**

- **Charts:** Inventory turnover, trends, valuation — fetch aggregates from APIs.
- **Audit Logs (optional):** List of all critical actions.
- **UI:** Use chart library (Recharts, Chart.js) for visual stats.

### 3. **Key Design Patterns & Interfaces**

| Layer      | Key Patterns/Interfaces                                      |
|------------|--------------------------------------------------------------|
| Routing    | `React Router` (all pages modular, role-based guarded)       |
| State      | Redux for app/global data                                    |
| API Layer  | Axios singleton + interceptors, hooks for all list endpoints |
| Forms      | `react-hook-form` + `yup` validation                         |
| UI Guard   | Role-based conditional rendering (from `AuthContext`)        |
| Pagination | All tables, pulls `.count`, enables page/size controls       |
| Modals     | Used for all creates/edits; can be reused or generic         |
| Notifications | Snackbar/Notistack, global error/success handling         |

### 4. **How to Extend and Maintain**

- **Fully Modular:** Place all logic/UI for a domain in a single folder under `/features`; if app grows, migrate to Redux Toolkit.
- **Roles & Business Rules:** Never rely only on backend 401/403. Block in UI for clarity and UX.
- **Strict Types:** Create common field/type objects in `/utils`, share zod/yup schemas.
- **Testing:** Each feature exports test files for CRUD validation, role guards, business rule enforcement.

### 5. **API Integration: Call Order & Data Dependency**

1. **Login and get JWT** → **Load user role**
2. **Create category, supplier, warehouse** (as needed)
3. **Create locations** (need warehouse ID)
4. **Create product** (needs supplier, category, warehouse ID)
5. **Create stock** (needs product, warehouse, location ID)
6. **Create purchase/sales order** (requires relevant IDs and stock check)
7. **Mutate stock: movements/adjustments with required approval**
8. **Error Handling:** Show API errors inline or via snackbar, always fetch IDs live for foreign keys

### 6. **Example: Product Creation Flow Diagrams**

**UI Flow:**
```
User (Admin/Manager) → Products Page → [Add Product]
   → (fetch: categories, suppliers, warehouses)
   → Fill Form → Submit
       → pre-validate all fields (frontend)
       → POST /api/products/ (API, with FK IDs)
         → [200 OK] → Close modal, refresh table, show Snackbar: "Product created"
         → [400/Validation] → Show errors inline, no submission
```

**Sequence Diagram:**
```
User Action       UI State      API Call & Result
-----------       ---------     --------------------
Open Create Form  Modal open    -- (fetch dropdowns)
Fill fields       Inputs valid  --
Press Submit      Submit busy   POST /api/products/
                ← [200]        Add row, close modal, Snackbar
                ← [400 error]  Show validation at fields
```

### 7. **Diagrammatic Representation**

```plaintext
[AuthContext]----+
   |             |
[Routing]-----[Dashboard]----[Feature Pages]------[API Layer/AXIOS]
                   |           |           |
              [Products]  [Suppliers]  [Inventory]
                             ... 
```

