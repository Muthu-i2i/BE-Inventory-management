import { Router } from 'express';
import { 
  getSuppliers, 
  getSupplier, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier 
} from './controllers/supplier.controller';
import { authenticate, authorize } from './middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/suppliers
router.get('/', getSuppliers);

// GET /api/suppliers/:id
router.get('/:id', getSupplier);

// POST /api/suppliers
router.post('/', authorize('admin', 'manager'), createSupplier);

// PATCH /api/suppliers/:id
router.patch('/:id', authorize('admin', 'manager'), updateSupplier);

// DELETE /api/suppliers/:id
router.delete('/:id', authorize('admin'), deleteSupplier);

export default router;