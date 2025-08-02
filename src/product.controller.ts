import { Request, Response, NextFunction } from 'express';
import { prisma } from './lib/prisma';
import { AppError } from './middleware/errorHandler';
import { AuthenticatedRequest, PaginationQuery } from './types/route.types';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', page_size = '10' } = req.query as PaginationQuery;
    const skip = (parseInt(page) - 1) * parseInt(page_size);
    const take = parseInt(page_size);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take,
        include: {
          category: true,
          supplier: true,
          warehouse: true
        }
      }),
      prisma.product.count()
    ]);

    res.json({
      data: products,
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

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        supplier: true,
        warehouse: true,
        stocks: {
          include: {
            location: true
          }
        }
      }
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, sku, barcode, categoryId, supplierId, warehouseId, unitPrice, price } = req.body;

    // Validate required fields
    if (!name || !sku || !barcode || !categoryId || !supplierId || !warehouseId || !unitPrice || !price) {
      throw new AppError('Missing required fields', 400);
    }

    // Check if SKU or barcode already exists
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { sku },
          { barcode }
        ]
      }
    });

    if (existing) {
      throw new AppError('SKU or barcode already exists', 400);
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        barcode,
        categoryId: parseInt(categoryId),
        supplierId: parseInt(supplierId),
        warehouseId: parseInt(warehouseId),
        unitPrice: parseFloat(unitPrice),
        price: parseFloat(price)
      },
      include: {
        category: true,
        supplier: true,
        warehouse: true
      }
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, unitPrice, price } = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        unitPrice: unitPrice ? parseFloat(unitPrice) : undefined,
        price: price ? parseFloat(price) : undefined
      },
      include: {
        category: true,
        supplier: true,
        warehouse: true
      }
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if product has any related stocks
    const stocks = await prisma.stock.findMany({
      where: { productId: parseInt(id) }
    });

    if (stocks.length > 0) {
      throw new AppError('Cannot delete product with existing stock', 400);
    }

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};