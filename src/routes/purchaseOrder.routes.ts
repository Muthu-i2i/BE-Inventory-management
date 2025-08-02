import { Router } from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  receivePurchaseOrder,
  deletePurchaseOrder
} from '../controllers/purchaseOrder.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation/validator';
import { 
  createPurchaseOrderSchema, 
  updatePurchaseOrderSchema 
} from '../middleware/validation/schemas';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PurchaseOrderItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *         - unitPrice
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         productId:
 *           type: integer
 *           description: Product ID
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Quantity to order
 *         unitPrice:
 *           type: number
 *           description: Price per unit
 *         product:
 *           $ref: '#/components/schemas/Product'
 *     PurchaseOrder:
 *       type: object
 *       required:
 *         - supplierId
 *         - items
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         supplierId:
 *           type: integer
 *           description: Supplier ID
 *         status:
 *           type: string
 *           enum: [open, received, cancelled]
 *           description: Order status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PurchaseOrderItem'
 *         supplier:
 *           $ref: '#/components/schemas/Supplier'
 *         totalAmount:
 *           type: number
 *           description: Total order amount
 */

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /purchase-orders:
 *   get:
 *     summary: Get all purchase orders
 *     tags: [Purchase Orders]
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
 *         name: supplier_id
 *         schema:
 *           type: integer
 *         description: Filter by supplier
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, received, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of purchase orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PurchaseOrder'
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
router.get('/', getPurchaseOrders);

/**
 * @swagger
 * /purchase-orders/{id}:
 *   get:
 *     summary: Get purchase order details by ID
 *     tags: [Purchase Orders]
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
 *         description: Purchase order details with items and supplier info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseOrder'
 *       404:
 *         description: Purchase order not found
 */
router.get('/:id', getPurchaseOrder);

/**
 * @swagger
 * /purchase-orders:
 *   post:
 *     summary: Create a new purchase order
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplierId
 *               - items
 *             properties:
 *               supplierId:
 *                 type: integer
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                     - unitPrice
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                     unitPrice:
 *                       type: number
 *                       minimum: 0
 *     responses:
 *       201:
 *         description: Purchase order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseOrder'
 *       400:
 *         description: Invalid input or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       403:
 *         description: Not authorized
 */
router.post(
  '/', 
  authorize('admin', 'manager'),
  validate(createPurchaseOrderSchema),
  createPurchaseOrder
);

/**
 * @swagger
 * /purchase-orders/{id}:
 *   patch:
 *     summary: Update purchase order status
 *     tags: [Purchase Orders]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, cancelled]
 *     responses:
 *       200:
 *         description: Purchase order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseOrder'
 *       400:
 *         description: Invalid status or order already received
 *       404:
 *         description: Purchase order not found
 */
router.patch(
  '/:id',
  authorize('admin', 'manager'),
  validate(updatePurchaseOrderSchema),
  updatePurchaseOrder
);

/**
 * @swagger
 * /purchase-orders/{id}/receive:
 *   post:
 *     summary: Mark purchase order as received and update stock
 *     tags: [Purchase Orders]
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
 *         description: Purchase order received and stock updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PurchaseOrder'
 *                 - type: object
 *                   properties:
 *                     stockMovements:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StockMovement'
 *       400:
 *         description: Order already received or invalid status
 *       404:
 *         description: Purchase order not found
 */
router.post(
  '/:id/receive',
  authorize('admin', 'manager'),
  receivePurchaseOrder
);

/**
 * @swagger
 * /purchase-orders/{id}:
 *   delete:
 *     summary: Delete a purchase order
 *     tags: [Purchase Orders]
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
 *         description: Purchase order deleted successfully
 *       400:
 *         description: Cannot delete received purchase order
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Purchase order not found
 */
router.delete(
  '/:id',
  authorize('admin'),
  deletePurchaseOrder
);

export default router;