import { Request, Response, NextFunction } from 'express';
import { SalesOrderService } from '../services/salesOrder.service';
import { AuthenticatedRequest } from '../types/route.types';

const salesOrderService = new SalesOrderService();

export const getSalesOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, page_size, customer_id, status, start_date, end_date } = req.query;
    
    const filters = {
      ...(customer_id && { customerId: parseInt(customer_id as string) }),
      ...(status && { status: status as string }),
      ...(start_date && { startDate: new Date(start_date as string) }),
      ...(end_date && { endDate: new Date(end_date as string) })
    };

    const result = await salesOrderService.getSalesOrders(
      parseInt(page as string) || 1,
      parseInt(page_size as string) || 10,
      filters
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getSalesOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await salesOrderService.getSalesOrderById(parseInt(id));
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const createSalesOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId, items } = req.body;

    // Validate request body
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request body. customerId and items array are required.'
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

    const order = await salesOrderService.createSalesOrder({
      customerId,
      items
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const updateSalesOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Status is required for update.'
      });
    }

    const order = await salesOrderService.updateSalesOrder(parseInt(id), {
      status
    });

    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const cancelSalesOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await salesOrderService.cancelSalesOrder(parseInt(id));
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const getSalesOrderStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        status: 'error',
        message: 'Start date and end date are required for stats.'
      });
    }

    const stats = await salesOrderService.getSalesOrderStats(
      new Date(start_date as string),
      new Date(end_date as string)
    );

    res.json(stats);
  } catch (error) {
    next(error);
  }
};