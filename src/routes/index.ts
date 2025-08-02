import { Express } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import supplierRoutes from './supplier.routes';
import warehouseRoutes from './warehouse.routes';
import stockRoutes from './stock.routes';
import purchaseOrderRoutes from './purchaseOrder.routes';
import salesOrderRoutes from './salesOrder.routes';
import reportRoutes from './report.routes';

export const setupRoutes = (app: Express) => {
  // Auth routes
  app.use('/api/auth', authRoutes);

  // Core entity routes
  app.use('/api/products', productRoutes);
  app.use('/api/suppliers', supplierRoutes);
  app.use('/api/warehouses', warehouseRoutes);
  app.use('/api/stock', stockRoutes);

  // Order management routes
  app.use('/api/purchase-orders', purchaseOrderRoutes);
  app.use('/api/sales-orders', salesOrderRoutes);

  // Reporting routes
  app.use('/api/reports', reportRoutes);
};