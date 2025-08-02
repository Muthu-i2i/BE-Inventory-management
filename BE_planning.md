## Planning Document: Node.js Backend (BE) for Inventory Management System

This planning document describes the key steps and architectural decisions to build a Node.js backend, modeled after the provided API spec, using SQLite for storage. It also ensures deployment suitability (e.g., Railway, Render, Fly.io, etc. for free plans), and supports access by a frontend hosted on Vercel.

### 1. **Tech Stack & Framework Choices**

- **Backend Framework**: [Express.js](https://expressjs.com/)
  - Simple, widely used, suited for APIs.
- **Database**: SQLite
  - Serverless, lightweight, easy for local dev/test, deployable on free cloud DB plans.
  - ORM: [Prisma](https://www.prisma.io/) (recommended for type safety, migrations, and easy schema management).
- **Authentication**: JWT (using packages such as `jsonwebtoken` and `bcrypt` for hashing).
- **CORS**: Allow origins from your Vercel deployment to connect.
- **Other**: Dotenv for config/secrets, Helmet for security, Winston or similar for logging.

### 2. **Project Structure**

```
/project-root
  /src
    /controllers  -> Business logic for API endpoints
    /routes       -> API route definitions and validations
    /models       -> Database models (Prisma/Sequelize schemas)
    /middleware   -> Auth, error handling, logging
    /utils        -> Auxillary helper functions and DTOs
    /config       -> Environment, database, CORS, JWT, etc.
    server.js
  prisma/schema.prisma -> DB schema (if using Prisma)
  package.json
  .env
  /tests         -> (optional) Jest or Mocha test files
  README.md
```

### 3. **Database Modeling (Suggested Tables)**

- **User** (id, username, hashed_password, role)
- **Category** (id, name)
- **Supplier** (id, name, email)
- **Warehouse** (id, name, capacity, address)
- **Location** (id, name, warehouse_id)
- **Product** (id, name, sku, barcode, category_id, supplier_id, warehouse_id, unit_price, price)
- **Stock** (id, product_id, warehouse_id, location_id, quantity)
- **PurchaseOrder** (id, supplier_id, status, created_at)
- **PurchaseOrderItem** (id, purchase_order_id, product_id, quantity, unit_price)
- **SalesOrder** (id, customer_id, status, created_at)
- **SalesOrderItem** (id, sales_order_id, product_id, quantity, unit_price)
- **StockMovement** (id, stock_id, movement_type, quantity, reason, created_at)
- **StockAdjustment** (id, stock_id, adjustment_type, quantity, reason, approved_by)
- **AuditLog** (id, action, entity, entity_id, user_id, details, timestamp)
- **Customer** (id, name, email, phone, address) — if customer master data is needed for sales orders

### 4. **Environment Configuration**

- `.env` file for secrets:
  ```
  DATABASE_URL="file:./dev.sqlite"
  JWT_SECRET=""
  CORS_ORIGIN="https://your-vercel-domain.vercel.app"
  ```
- Default port: 3000

### 5. **API Design & Implementation**

- **Base URL**: `/api/`
- Replicate all endpoints as per the provided documentation (authentication, CRUD for all entities, error handling, etc.)[1].
- Standardize responses, follow status codes.

#### Key Middleware:
- **CORS**: Allow requests from Vercel FE deploy.
- **JWT Auth**: Protect all routes except login.
- **Error Handler**: Global error response.
- **Role Guard**: Block unauthorized actions per role.

### 6. **Deployment Plan**

- **Platform**: Railway, Render, Fly.io, or similar (all have free tiers with SQLite support and easy GitHub integration).
- **CI/CD**: Deploy from GitHub on push, set environment variables in the host’s dashboard.
- **Prisma Migrate**: Run migration automatically before app boot (add in deploy script).
- **DB Persistence**: Ensure your platform supports persistent storage for SQLite file (or use Railway’s DB add-on).

### 7. **Cross-Origin Resource Sharing (CORS) Setup**

- Whitelist your frontend Vercel domain.
- Example (Express.js):
  ```js
  const cors = require('cors');
  app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }));
  ```

### 8. **Security, Error Handling, and Validation**

- **Password Hashing**: Use bcrypt.
- **JWT**: Use for all auth-protected endpoints; refresh tokens stored securely (consider in-memory/per-request, not in database for small-scale).
- **Input Validation**: Use Joi, Zod, or Express Validator for POST/PATCH payloads.
- **Rate Limiting/Helmet**: Add to prevent abuse on public endpoints.

### 9. **Sample User Stories & API Call Flow**

- Admin signs up (seed user), gets JWT.
- Creates categories, suppliers, warehouses.
- Proceeds to populate locations (link to warehouses).
- Adds products (must link to categories/suppliers/warehouses).
- Adds stock (link to products, warehouse/location).
- Creates and fulfills purchase/sales orders.
- Records stock adjustments and movement.
- All API interactions return structured JSON, errors have `detail` fields and field-level errors as described[1].

### 10. **Testing**

- **Unit tests** for controllers, middleware, and utils using Jest or Mocha/Chai.
- **Integration tests** to check API workflows (you can use Supertest).
- **Manual Test**: After deployment, use Postman or the FE to interact across endpoints.

### 11. **Readme and Documentation**

- Usage instructions (install, dev, deploy).
- Setup for local development (`npm run dev`, migration commands).
- Usage of `.env` for secrets.
- API documentation link or instructions to generate OpenAPI spec (you can use Swagger auto-generators for Express for docs).

### 12. **Alternative Considerations**

If you outgrow free SQLite hosting or require multi-user concurrency, consider:
- PostgreSQL for scalable hosted DB (Railway, Supabase, Neon, etc., with free plans).
