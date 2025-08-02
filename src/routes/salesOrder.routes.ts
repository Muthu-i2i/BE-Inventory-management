import { Router } from 'express';
import {
  getSalesOrders,
  getSalesOrder,
  createSalesOrder,
  updateSalesOrder,
  cancelSalesOrder,
  getSalesOrderStats
} from '../controllers/salesOrder.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation/validator';
import { 
  createSalesOrderSchema, 
  updateSalesOrderSchema,
  reportQuerySchema 
} from '../middleware/validation/schemas';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/sales-orders
router.get('/', getSalesOrders);

// GET /api/sales-orders/stats
router.get(
  '/stats',
  authorize('admin', 'manager'),
  validate(reportQuerySchema, 'query'),
  getSalesOrderStats
);

// GET /api/sales-orders/:id
router.get('/:id', getSalesOrder);

// POST /api/sales-orders
router.post(
  '/',
  validate(createSalesOrderSchema),
  createSalesOrder
);

// PATCH /api/sales-orders/:id
router.patch(
  '/:id',
  authorize('admin', 'manager'),
  validate(updateSalesOrderSchema),
  updateSalesOrder
);

// POST /api/sales-orders/:id/cancel
router.post(
  '/:id/cancel',
  authorize('admin', 'manager'),
  cancelSalesOrder
);

export default router;