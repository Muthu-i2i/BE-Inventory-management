import { Request, Response, NextFunction } from 'express';
import { prisma } from './lib/prisma';
import { AppError } from './middleware/errorHandler';
import { AuthenticatedRequest, PaginationQuery } from './types/route.types';

export const getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', page_size = '10' } = req.query as PaginationQuery;
    const skip = (parseInt(page) - 1) * parseInt(page_size);
    const take = parseInt(page_size);

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        skip,
        take,
        include: {
          _count: {
            select: {
              products: true,
              purchaseOrders: true
            }
          }
        }
      }),
      prisma.supplier.count()
    ]);

    res.json({
      data: suppliers,
      pagination: {
        total,
        page: parseInt(page),
        page_size: parseInt(page_size),
        total_pages: Math.ceil(total / parseInt(page_size))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: true,
        purchaseOrders: {
          include: {
            items: true
          }
        }
      }
    });

    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      throw new AppError('Name and email are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        email
      }
    });

    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError('Invalid email format', 400);
      }
    }

    const supplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email
      }
    });

    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if supplier has any related products or purchase orders
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            products: true,
            purchaseOrders: true
          }
        }
      }
    });

    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    if (supplier._count.products > 0 || supplier._count.purchaseOrders > 0) {
      throw new AppError('Cannot delete supplier with existing products or purchase orders', 400);
    }

    await prisma.supplier.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};