import { Router } from 'express';
import {
  getInventoryValue,
  getLowStock,
  getStockMovements,
  getSalesReport,
  getPurchaseReport,
  getWarehouseUtilization
} from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation/validator';
import { reportQuerySchema } from '../middleware/validation/schemas';

const router = Router();

// Apply authentication and manager/admin authorization to all routes
router.use(authenticate);
router.use(authorize('admin', 'manager'));

// GET /api/reports/inventory-value
router.get('/inventory-value', getInventoryValue);

// GET /api/reports/low-stock
router.get('/low-stock', getLowStock);

// GET /api/reports/stock-movements
router.get(
  '/stock-movements',
  validate(reportQuerySchema, 'query'),
  getStockMovements
);

// GET /api/reports/sales
router.get(
  '/sales',
  validate(reportQuerySchema, 'query'),
  getSalesReport
);

// GET /api/reports/purchases
router.get(
  '/purchases',
  validate(reportQuerySchema, 'query'),
  getPurchaseReport
);

// GET /api/reports/warehouse-utilization
router.get('/warehouse-utilization', getWarehouseUtilization);

export default router;