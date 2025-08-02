import { Router } from 'express';
import {
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  addLocation,
  removeLocation
} from '../controllers/warehouse.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation/validator';
import { createWarehouseSchema, updateWarehouseSchema } from '../middleware/validation/schemas';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Warehouse:
 *       type: object
 *       required:
 *         - name
 *         - capacity
 *         - address
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Warehouse name
 *         capacity:
 *           type: integer
 *           description: Total storage capacity
 *         address:
 *           type: string
 *           description: Physical address
 *         locations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Location'
 *     Location:
 *       type: object
 *       required:
 *         - name
 *         - warehouseId
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Location name/code
 *         warehouseId:
 *           type: integer
 *           description: Parent warehouse ID
 */

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /warehouses:
 *   get:
 *     summary: Get all warehouses
 *     tags: [Warehouses]
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
 *         description: List of warehouses with their locations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Warehouse'
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
router.get('/', getWarehouses);

/**
 * @swagger
 * /warehouses/{id}:
 *   get:
 *     summary: Get warehouse details by ID
 *     tags: [Warehouses]
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
 *         description: Warehouse details with locations and stock counts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Warehouse'
 *       404:
 *         description: Warehouse not found
 */
router.get('/:id', getWarehouse);

/**
 * @swagger
 * /warehouses:
 *   post:
 *     summary: Create a new warehouse
 *     tags: [Warehouses]
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
 *               - capacity
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Warehouse created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Warehouse'
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Not authorized
 */
router.post(
  '/',
  authorize('admin', 'manager'),
  validate(createWarehouseSchema),
  createWarehouse
);

/**
 * @swagger
 * /warehouses/{id}:
 *   patch:
 *     summary: Update warehouse details
 *     tags: [Warehouses]
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
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Warehouse updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Warehouse'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Warehouse not found
 */
router.patch(
  '/:id',
  authorize('admin', 'manager'),
  validate(updateWarehouseSchema),
  updateWarehouse
);

/**
 * @swagger
 * /warehouses/{id}:
 *   delete:
 *     summary: Delete a warehouse
 *     tags: [Warehouses]
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
 *         description: Warehouse deleted successfully
 *       400:
 *         description: Cannot delete warehouse with existing stock
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Warehouse not found
 */
router.delete(
  '/:id',
  authorize('admin'),
  deleteWarehouse
);

/**
 * @swagger
 * /warehouses/{warehouseId}/locations:
 *   post:
 *     summary: Add a new location to a warehouse
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: warehouseId
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Location name/code
 *     responses:
 *       201:
 *         description: Location added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Warehouse not found
 */
router.post(
  '/:warehouseId/locations',
  authorize('admin', 'manager'),
  addLocation
);

/**
 * @swagger
 * /warehouses/locations/{locationId}:
 *   delete:
 *     summary: Remove a location from a warehouse
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Location removed successfully
 *       400:
 *         description: Cannot remove location with existing stock
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Location not found
 */
router.delete(
  '/locations/:locationId',
  authorize('admin', 'manager'),
  removeLocation
);

export default router;