import Joi from 'joi';

// Common schemas
const paginationSchema = {
  page: Joi.number().min(1).optional(),
  page_size: Joi.number().min(1).max(100).optional()
};

const dateRangeSchema = {
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).required()
};

// Auth schemas
export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

export const registerSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'manager', 'user').default('user')
});

// Product schemas
export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  sku: Joi.string().required(),
  barcode: Joi.string().required(),
  categoryId: Joi.number().required(),
  supplierId: Joi.number().required(),
  warehouseId: Joi.number().required(),
  unitPrice: Joi.number().min(0).required(),
  price: Joi.number().min(0).required()
});

export const updateProductSchema = Joi.object({
  name: Joi.string().optional(),
  unitPrice: Joi.number().min(0).optional(),
  price: Joi.number().min(0).optional(),
  categoryId: Joi.number().optional(),
  supplierId: Joi.number().optional(),
  warehouseId: Joi.number().optional()
}).min(1);

// Warehouse schemas
export const createWarehouseSchema = Joi.object({
  name: Joi.string().required(),
  capacity: Joi.number().min(1).required(),
  address: Joi.string().required()
});

export const updateWarehouseSchema = Joi.object({
  name: Joi.string().optional(),
  capacity: Joi.number().min(1).optional(),
  address: Joi.string().optional()
}).min(1);

// Stock schemas
export const createStockSchema = Joi.object({
  productId: Joi.number().required(),
  warehouseId: Joi.number().required(),
  locationId: Joi.number().required(),
  quantity: Joi.number().min(0).required()
});

export const stockMovementSchema = Joi.object({
  movementType: Joi.string().valid('IN', 'OUT').required(),
  quantity: Joi.number().min(1).required(),
  reason: Joi.string().required()
});

export const stockAdjustmentSchema = Joi.object({
  adjustmentType: Joi.string().valid('ADD', 'REMOVE').required(),
  quantity: Joi.number().min(1).required(),
  reason: Joi.string().required()
});

export const stockTransferSchema = Joi.object({
  targetLocationId: Joi.number().required(),
  quantity: Joi.number().min(1).required(),
  reason: Joi.string().required()
});

// Purchase Order schemas
export const createPurchaseOrderSchema = Joi.object({
  supplierId: Joi.number().required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().required(),
      quantity: Joi.number().min(1).required(),
      unitPrice: Joi.number().min(0).required()
    })
  ).min(1).required()
});

export const updatePurchaseOrderSchema = Joi.object({
  status: Joi.string().valid('open', 'received', 'cancelled').required()
});

// Sales Order schemas
export const createSalesOrderSchema = Joi.object({
  customerId: Joi.number().required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().required(),
      quantity: Joi.number().min(1).required(),
      unitPrice: Joi.number().min(0).required()
    })
  ).min(1).required()
});

export const updateSalesOrderSchema = Joi.object({
  status: Joi.string().valid('open', 'completed', 'cancelled').required()
});

// Report schemas
export const reportQuerySchema = Joi.object({
  ...dateRangeSchema,
  ...paginationSchema
});

// Supplier schemas
export const createSupplierSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required()
});

export const updateSupplierSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional()
}).min(1);