import { Request, Response, NextFunction } from 'express';
import { WarehouseService } from '../services/warehouse.service';
import { AuthenticatedRequest } from '../types/route.types';

const warehouseService = new WarehouseService();

export const getWarehouses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, page_size } = req.query;
    const result = await warehouseService.getWarehouses(
      parseInt(page as string) || 1,
      parseInt(page_size as string) || 10
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const warehouse = await warehouseService.getWarehouseById(parseInt(id));
    res.json(warehouse);
  } catch (error) {
    next(error);
  }
};

export const createWarehouse = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const warehouse = await warehouseService.createWarehouse(req.body);
    res.status(201).json(warehouse);
  } catch (error) {
    next(error);
  }
};

export const updateWarehouse = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const warehouse = await warehouseService.updateWarehouse(parseInt(id), req.body);
    res.json(warehouse);
  } catch (error) {
    next(error);
  }
};

export const deleteWarehouse = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await warehouseService.deleteWarehouse(parseInt(id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const addLocation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { warehouseId } = req.params;
    const { name } = req.body;
    const location = await warehouseService.addLocation(parseInt(warehouseId), name);
    res.status(201).json(location);
  } catch (error) {
    next(error);
  }
};

export const removeLocation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { locationId } = req.params;
    await warehouseService.removeLocation(parseInt(locationId));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};