import { Request, Response, NextFunction } from 'express';
import { SupplierService } from '../services/supplier.service';
import { AuthenticatedRequest } from '../types/route.types';

const supplierService = new SupplierService();

export const getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, page_size, search } = req.query;
    const result = await supplierService.getSuppliers(
      parseInt(page as string) || 1,
      parseInt(page_size as string) || 10,
      search as string
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const supplier = await supplierService.getSupplierById(parseInt(id));
    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const supplier = await supplierService.createSupplier(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const supplier = await supplierService.updateSupplier(parseInt(id), req.body);
    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await supplierService.deleteSupplier(parseInt(id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getSupplierStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const stats = await supplierService.getSupplierStats(parseInt(id));
    res.json(stats);
  } catch (error) {
    next(error);
  }
};