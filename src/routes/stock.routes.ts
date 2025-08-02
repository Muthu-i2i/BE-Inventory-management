import { Router } from 'express';
import {
  getStocks,
  getStock,
  createStock,
  recordMovement,
  adjustStock,
  transferStock
} from '../controllers/stock.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation/validator';
import {
  createStockSchema,
  stockMovementSchema,
  stockAdjustmentSchema,
  stockTransferSchema
} from '../middleware/validation/schemas';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Stock:
 *       type: object
 *       required:
 *         - productId
 *         - warehouseId
 *         - locationId
 *         - quantity
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         productId:
 *           type: integer
 *           description: Product ID
 *         warehouseId:
 *           type: integer
 *           description: Warehouse ID
 *         locationId:
 *           type: integer
 *           description: Location ID within warehouse
 *         quantity:
 *           type: integer
 *           description: Current stock quantity
 *     StockMovement:
 *       type: object
 *       required:
 *         - movementType
 *         - quantity
 *         - reason
 *       properties:
 *         movementType:
 *           type: string
 *           enum: [IN, OUT]
 *           description: Type of movement
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Quantity to move
 *         reason:
 *           type: string
 *           description: Reason for movement
 */

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /stock:
 *   get:
 *     summary: Get all stock entries with pagination
 *     tags: [Stock]
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
 *     responses:
 *       200:
 *         description: List of stock entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Stock'
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
router.get('/', getStocks);

/**
 * @swagger
 * /stock/{id}:
 *   get:
 *     summary: Get stock details by ID
 *     tags: [Stock]
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
 *         description: Stock details with movements and adjustments
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Stock'
 *                 - type: object
 *                   properties:
 *                     movements:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StockMovement'
 */
router.get('/:id', getStock);

/**
 * @swagger
 * /stock:
 *   post:
 *     summary: Create new stock entry
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Stock'
 *     responses:
 *       201:
 *         description: Stock created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stock'
 */
router.post(
  '/',
  authorize('admin', 'manager'),
  validate(createStockSchema),
  createStock
);

/**
 * @swagger
 * /stock/{stockId}/movements:
 *   post:
 *     summary: Record stock movement (in/out)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stockId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockMovement'
 *     responses:
 *       201:
 *         description: Movement recorded successfully
 *       400:
 *         description: Invalid input or insufficient stock
 *       404:
 *         description: Stock not found
 */
router.post(
  '/:stockId/movements',
  authorize('admin', 'manager'),
  validate(stockMovementSchema),
  recordMovement
);

/**
 * @swagger
 * /stock/{stockId}/adjustments:
 *   post:
 *     summary: Adjust stock quantity
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stockId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adjustmentType
 *               - quantity
 *               - reason
 *             properties:
 *               adjustmentType:
 *                 type: string
 *                 enum: [ADD, REMOVE]
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Stock adjusted successfully
 *       400:
 *         description: Invalid input or insufficient stock
 *       403:
 *         description: Not authorized
 */
router.post(
  '/:stockId/adjustments',
  authorize('admin', 'manager'),
  validate(stockAdjustmentSchema),
  adjustStock
);

/**
 * @swagger
 * /stock/{sourceStockId}/transfer:
 *   post:
 *     summary: Transfer stock between locations
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sourceStockId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetLocationId
 *               - quantity
 *               - reason
 *             properties:
 *               targetLocationId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock transferred successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sourceStock:
 *                   $ref: '#/components/schemas/Stock'
 *                 targetStock:
 *                   $ref: '#/components/schemas/Stock'
 */
router.post(
  '/:sourceStockId/transfer',
  authorize('admin', 'manager'),
  validate(stockTransferSchema),
  transferStock
);

export default router;