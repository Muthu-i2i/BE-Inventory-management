import { Request, Response, NextFunction } from 'express';
import { StockService } from '../services/stock.service';
import { AuthenticatedRequest } from '../types/route.types';

const stockService = new StockService();

export const getStocks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, page_size } = req.query;
    const result = await stockService.getStocks(
      parseInt(page as string) || 1,
      parseInt(page_size as string) || 10
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const stock = await stockService.getStockById(parseInt(id));
    res.json(stock);
  } catch (error) {
    next(error);
  }
};

export const createStock = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const stock = await stockService.createStock(req.body);
    res.status(201).json(stock);
  } catch (error) {
    next(error);
  }
};

export const recordMovement = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { stockId } = req.params;
    const movement = await stockService.recordMovement({
      stockId: parseInt(stockId),
      ...req.body
    });
    res.status(201).json(movement);
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { stockId } = req.params;
    if (!req.user?.userId) {
      throw new Error('User not authenticated');
    }
    const adjustment = await stockService.adjustStock({
      stockId: parseInt(stockId),
      approvedById: req.user.userId,
      ...req.body
    });
    res.status(201).json(adjustment);
  } catch (error) {
    next(error);
  }
};

export const transferStock = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { sourceStockId } = req.params;
    const result = await stockService.transferStock({
      sourceStockId: parseInt(sourceStockId),
      ...req.body
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};