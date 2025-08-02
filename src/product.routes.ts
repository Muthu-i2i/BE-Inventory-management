import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from './controllers/product.controller';
import { authenticate, authorize } from './middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/products
router.get('/', getProducts);

// GET /api/products/:id
router.get('/:id', getProduct);

// POST /api/products
router.post('/', authorize('admin', 'manager'), createProduct);

// PATCH /api/products/:id
router.patch('/:id', authorize('admin', 'manager'), updateProduct);

// DELETE /api/products/:id
router.delete('/:id', authorize('admin'), deleteProduct);

export default router;