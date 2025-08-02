import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export class SalesOrderService {
  async getSalesOrders(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [orders, total] = await Promise.all([
      prisma.salesOrder.findMany({
        skip,
        take,
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.salesOrder.count()
    ]);

    return {
      data: orders,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  async getSalesOrderById(id: number) {
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      throw new AppError('Sales order not found', 404);
    }

    return order;
  }

  async createSalesOrder(data: {
    customerId: number;
    items: Array<{
      productId: number;
      quantity: number;
      unitPrice: number;
    }>;
  }) {
    const { customerId, items } = data;

    if (!items.length) {
      throw new AppError('Sales order must have at least one item', 400);
    }

    // Check stock availability for all items
    const stockChecks = await Promise.all(
      items.map(async (item) => {
        const stock = await prisma.stock.findFirst({
          where: { productId: item.productId },
          select: {
            quantity: true,
            product: {
              select: { name: true }
            }
          }
        });

        if (!stock || stock.quantity < item.quantity) {
          return {
            productName: stock?.product.name || 'Unknown product',
            available: stock?.quantity || 0,
            requested: item.quantity,
            isAvailable: false
          };
        }
        return { isAvailable: true };
      })
    );

    const unavailableItems = stockChecks.filter(check => !check.isAvailable);
    if (unavailableItems.length > 0) {
      throw new AppError(
        'Insufficient stock for items: ' + 
        unavailableItems.map(item => 
          `${item.productName} (requested: ${item.requested}, available: ${item.available})`
        ).join(', '),
        400
      );
    }

    return prisma.$transaction(async (tx) => {
      // Create sales order
      const order = await tx.salesOrder.create({
        data: {
          customerId,
          status: 'open',
          items: {
            create: items
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Reduce stock quantities
      for (const item of items) {
        const stock = await tx.stock.findFirst({
          where: { productId: item.productId }
        });

        if (stock) {
          await tx.stock.update({
            where: { id: stock.id },
            data: { quantity: stock.quantity - item.quantity }
          });

          // Record stock movement
          await tx.stockMovement.create({
            data: {
              stockId: stock.id,
              movementType: 'OUT',
              quantity: item.quantity,
              reason: `Sales Order #${order.id}`
            }
          });
        }
      }

      return order;
    });
  }

  async updateSalesOrder(id: number, data: {
    status?: string;
  }) {
    const order = await prisma.salesOrder.findUnique({
      where: { id }
    });

    if (!order) {
      throw new AppError('Sales order not found', 404);
    }

    if (order.status === 'completed') {
      throw new AppError('Cannot update a completed sales order', 400);
    }

    return prisma.salesOrder.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
  }

  async cancelSalesOrder(id: number) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUnique({
        where: { id },
        include: {
          items: true
        }
      });

      if (!order) {
        throw new AppError('Sales order not found', 404);
      }

      if (order.status === 'cancelled') {
        throw new AppError('Order is already cancelled', 400);
      }

      if (order.status === 'completed') {
        throw new AppError('Cannot cancel a completed order', 400);
      }

      // Restore stock quantities
      for (const item of order.items) {
        const stock = await tx.stock.findFirst({
          where: { productId: item.productId }
        });

        if (stock) {
          await tx.stock.update({
            where: { id: stock.id },
            data: { quantity: stock.quantity + item.quantity }
          });

          // Record stock movement
          await tx.stockMovement.create({
            data: {
              stockId: stock.id,
              movementType: 'IN',
              quantity: item.quantity,
              reason: `Sales Order #${order.id} cancelled`
            }
          });
        }
      }

      return tx.salesOrder.update({
        where: { id },
        data: { status: 'cancelled' },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
    });
  }
}