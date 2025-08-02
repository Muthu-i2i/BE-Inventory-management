import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export class StockService {
  async getStocks(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [stocks, total] = await Promise.all([
      prisma.stock.findMany({
        skip,
        take,
        include: {
          product: true,
          warehouse: true,
          location: true
        }
      }),
      prisma.stock.count()
    ]);

    return {
      data: stocks,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  async getStockById(id: number) {
    const stock = await prisma.stock.findUnique({
      where: { id },
      include: {
        product: true,
        warehouse: true,
        location: true,
        movements: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        adjustments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!stock) {
      throw new AppError('Stock not found', 404);
    }

    return stock;
  }

  async createStock(data: {
    productId: number;
    warehouseId: number;
    locationId: number;
    quantity: number;
  }) {
    const { productId, warehouseId, locationId, quantity } = data;

    // Validate location belongs to warehouse
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: { warehouse: true }
    });

    if (!location || location.warehouseId !== warehouseId) {
      throw new AppError('Invalid location for warehouse', 400);
    }

    // Check if stock already exists for this product in this location
    const existingStock = await prisma.stock.findFirst({
      where: {
        productId,
        locationId
      }
    });

    if (existingStock) {
      throw new AppError('Stock already exists for this product in this location', 400);
    }

    return prisma.stock.create({
      data: {
        productId,
        warehouseId,
        locationId,
        quantity
      },
      include: {
        product: true,
        warehouse: true,
        location: true
      }
    });
  }

  async recordMovement(data: {
    stockId: number;
    movementType: 'IN' | 'OUT';
    quantity: number;
    reason: string;
  }) {
    const { stockId, movementType, quantity, reason } = data;

    return prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findUnique({
        where: { id: stockId }
      });

      if (!stock) {
        throw new AppError('Stock not found', 404);
      }

      if (movementType === 'OUT' && stock.quantity < quantity) {
        throw new AppError('Insufficient stock quantity', 400);
      }

      const newQuantity = movementType === 'IN' 
        ? stock.quantity + quantity 
        : stock.quantity - quantity;

      await tx.stock.update({
        where: { id: stockId },
        data: { quantity: newQuantity }
      });

      return tx.stockMovement.create({
        data: {
          stockId,
          movementType,
          quantity,
          reason
        }
      });
    });
  }

  async adjustStock(data: {
    stockId: number;
    adjustmentType: 'ADD' | 'REMOVE';
    quantity: number;
    reason: string;
    approvedById: number;
  }) {
    const { stockId, adjustmentType, quantity, reason, approvedById } = data;

    return prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findUnique({
        where: { id: stockId }
      });

      if (!stock) {
        throw new AppError('Stock not found', 404);
      }

      if (adjustmentType === 'REMOVE' && stock.quantity < quantity) {
        throw new AppError('Insufficient stock quantity', 400);
      }

      const newQuantity = adjustmentType === 'ADD'
        ? stock.quantity + quantity
        : stock.quantity - quantity;

      await tx.stock.update({
        where: { id: stockId },
        data: { quantity: newQuantity }
      });

      return tx.stockAdjustment.create({
        data: {
          stockId,
          adjustmentType,
          quantity,
          reason,
          approvedById
        }
      });
    });
  }

  async transferStock(data: {
    sourceStockId: number;
    targetLocationId: number;
    quantity: number;
    reason: string;
  }) {
    const { sourceStockId, targetLocationId, quantity, reason } = data;

    return prisma.$transaction(async (tx) => {
      const sourceStock = await tx.stock.findUnique({
        where: { id: sourceStockId },
        include: {
          product: true,
          warehouse: true
        }
      });

      if (!sourceStock) {
        throw new AppError('Source stock not found', 404);
      }

      if (sourceStock.quantity < quantity) {
        throw new AppError('Insufficient stock quantity', 400);
      }

      // Check if target location is valid
      const targetLocation = await tx.location.findUnique({
        where: { id: targetLocationId }
      });

      if (!targetLocation) {
        throw new AppError('Target location not found', 404);
      }

      // Find or create stock in target location
      let targetStock = await tx.stock.findFirst({
        where: {
          productId: sourceStock.productId,
          locationId: targetLocationId
        }
      });

      if (!targetStock) {
        targetStock = await tx.stock.create({
          data: {
            productId: sourceStock.productId,
            warehouseId: targetLocation.warehouseId,
            locationId: targetLocationId,
            quantity: 0
          }
        });
      }

      // Update quantities
      await tx.stock.update({
        where: { id: sourceStockId },
        data: { quantity: sourceStock.quantity - quantity }
      });

      await tx.stock.update({
        where: { id: targetStock.id },
        data: { quantity: targetStock.quantity + quantity }
      });

      // Record movements
      await tx.stockMovement.createMany({
        data: [
          {
            stockId: sourceStockId,
            movementType: 'OUT',
            quantity,
            reason: `Transfer out: ${reason}`
          },
          {
            stockId: targetStock.id,
            movementType: 'IN',
            quantity,
            reason: `Transfer in: ${reason}`
          }
        ]
      });

      return {
        sourceStock: await tx.stock.findUnique({
          where: { id: sourceStockId },
          include: { location: true }
        }),
        targetStock: await tx.stock.findUnique({
          where: { id: targetStock.id },
          include: { location: true }
        })
      };
    });
  }
}