import { Request, Response, NextFunction } from 'express';
import { PurchaseOrderService } from '../services/purchaseOrder.service';
import { AuthenticatedRequest } from '../types/route.types';

const purchaseOrderService = new PurchaseOrderService();

export const getPurchaseOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, page_size, supplier_id, status } = req.query;
    
    const filters = {
      ...(supplier_id && { supplierId: parseInt(supplier_id as string) }),
      ...(status && { status: status as string })
    };

    const result = await purchaseOrderService.getPurchaseOrders(
      parseInt(page as string) || 1,
      parseInt(page_size as string) || 10,
      filters
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await purchaseOrderService.getPurchaseOrderById(parseInt(id));
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const createPurchaseOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { supplierId, items } = req.body;

    // Validate request body
    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request body. supplierId and items array are required.'
      });
    }

    // Validate each item in the items array
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.unitPrice) {
        return res.status(400).json({
          status: 'error',
          message: 'Each item must have productId, quantity, and unitPrice.'
        });
      }
    }

    const order = await purchaseOrderService.createPurchaseOrder({
      supplierId,
      items
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const updatePurchaseOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Status is required for update.'
      });
    }

    const order = await purchaseOrderService.updatePurchaseOrder(parseInt(id), {
      status
    });

    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const receivePurchaseOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await purchaseOrderService.receivePurchaseOrder(parseInt(id));
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const deletePurchaseOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await purchaseOrderService.deletePurchaseOrder(parseInt(id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};