import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation/validator';
import { createProductSchema, updateProductSchema } from '../middleware/validation/schemas';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - sku
 *         - barcode
 *         - categoryId
 *         - supplierId
 *         - warehouseId
 *         - unitPrice
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Product name
 *         sku:
 *           type: string
 *           description: Stock keeping unit (unique)
 *         barcode:
 *           type: string
 *           description: Product barcode (unique)
 *         categoryId:
 *           type: integer
 *           description: Category ID
 *         supplierId:
 *           type: integer
 *           description: Supplier ID
 *         warehouseId:
 *           type: integer
 *           description: Warehouse ID
 *         unitPrice:
 *           type: number
 *           description: Cost price
 *         price:
 *           type: number
 *           description: Selling price
 */

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with pagination
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for product name or SKU
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
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
router.get('/', getProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/:id', getProduct);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
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
 *               - sku
 *               - barcode
 *               - categoryId
 *               - supplierId
 *               - warehouseId
 *               - unitPrice
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               barcode:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               supplierId:
 *                 type: integer
 *               warehouseId:
 *                 type: integer
 *               unitPrice:
 *                 type: number
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input or duplicate SKU/barcode
 *       403:
 *         description: Not authorized
 */
router.post(
  '/',
  authorize('admin', 'manager'),
  validate(createProductSchema),
  createProduct
);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               unitPrice:
 *                 type: number
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 */
router.patch(
  '/:id',
  authorize('admin', 'manager'),
  validate(updateProductSchema),
  updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 *       400:
 *         description: Cannot delete product with existing stock
 */
router.delete(
  '/:id',
  authorize('admin'),
  deleteProduct
);

export default router;