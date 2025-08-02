import { Router } from 'express';
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierStats
} from '../controllers/supplier.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation/validator';
import { createSupplierSchema, updateSupplierSchema } from '../middleware/validation/schemas';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Supplier:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Supplier company name
 *         email:
 *           type: string
 *           format: email
 *           description: Contact email
 *     SupplierStats:
 *       type: object
 *       properties:
 *         totalOrders:
 *           type: integer
 *           description: Total number of purchase orders
 *         totalProducts:
 *           type: integer
 *           description: Number of products supplied
 *         totalSpent:
 *           type: number
 *           description: Total amount spent with this supplier
 *         ordersByStatus:
 *           type: object
 *           description: Purchase orders grouped by status
 *           properties:
 *             open:
 *               type: integer
 *             received:
 *               type: integer
 *             cancelled:
 *               type: integer
 */

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /suppliers:
 *   get:
 *     summary: Get all suppliers
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for supplier name or email
 *     responses:
 *       200:
 *         description: List of suppliers with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Supplier'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     page_size:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 */
router.get('/', getSuppliers);

/**
 * @swagger
 * /suppliers/stats:
 *   get:
 *     summary: Get supplier statistics
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Supplier statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupplierStats'
 *       403:
 *         description: Not authorized
 */
router.get('/stats', authorize('admin', 'manager'), getSupplierStats);

/**
 * @swagger
 * /suppliers/{id}:
 *   get:
 *     summary: Get supplier details by ID
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Supplier details with related products and orders
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Supplier'
 *                 - type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     purchaseOrders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           status:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       404:
 *         description: Supplier not found
 */
router.get('/:id', getSupplier);

/**
 * @swagger
 * /suppliers:
 *   post:
 *     summary: Create a new supplier
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Supplier created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       400:
 *         description: Invalid input or email already exists
 *       403:
 *         description: Not authorized
 */
router.post(
  '/',
  authorize('admin', 'manager'),
  validate(createSupplierSchema),
  createSupplier
);

/**
 * @swagger
 * /suppliers/{id}:
 *   patch:
 *     summary: Update supplier details
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Supplier updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       400:
 *         description: Invalid input or email already in use
 *       404:
 *         description: Supplier not found
 */
router.patch(
  '/:id',
  authorize('admin', 'manager'),
  validate(updateSupplierSchema),
  updateSupplier
);

/**
 * @swagger
 * /suppliers/{id}:
 *   delete:
 *     summary: Delete a supplier
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Supplier deleted successfully
 *       400:
 *         description: Cannot delete supplier with existing products or orders
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Supplier not found
 */
router.delete(
  '/:id',
  authorize('admin'),
  deleteSupplier
);

export default router;