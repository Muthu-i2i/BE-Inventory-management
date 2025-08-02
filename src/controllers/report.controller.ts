import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { AuthenticatedRequest } from '../types/route.types';

const reportService = new ReportService();

export const getInventoryValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportService.getInventoryValueReport();
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const getLowStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { threshold } = req.query;
    const report = await reportService.getLowStockReport(parseInt(threshold as string) || 10);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const getStockMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start_date, end_date } = req.query;
    const report = await reportService.getStockMovementReport(
      new Date(start_date as string),
      new Date(end_date as string)
    );
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const getSalesReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start_date, end_date } = req.query;
    const report = await reportService.getSalesReport(
      new Date(start_date as string),
      new Date(end_date as string)
    );
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const getPurchaseReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start_date, end_date } = req.query;
    const report = await reportService.getPurchaseReport(
      new Date(start_date as string),
      new Date(end_date as string)
    );
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const getWarehouseUtilization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportService.getWarehouseUtilizationReport();
    res.json(report);
  } catch (error) {
    next(error);
  }
};