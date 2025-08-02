import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export class PurchaseOrderService {
  async getPurchaseOrders(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        skip,
        take,
        include: {
          supplier: true,
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
      prisma.purchaseOrder.count()
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

  async getPurchaseOrderById(id: number) {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      throw new AppError('Purchase order not found', 404);
    }

    return order;
  }

  async createPurchaseOrder(data: {
    supplierId: number;
    items: Array<{
      productId: number;
      quantity: number;
      unitPrice: number;
    }>;
  }) {
    const { supplierId, items } = data;

    if (!items.length) {
      throw new AppError('Purchase order must have at least one item', 400);
    }

    // Validate supplier
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId }
    });

    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    // Validate products
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    });

    if (products.length !== productIds.length) {
      throw new AppError('One or more products not found', 400);
    }

    return prisma.purchaseOrder.create({
      data: {
        supplierId,
        status: 'open',
        items: {
          create: items
        }
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
  }

  async updatePurchaseOrder(id: number, data: {
    status?: string;
  }) {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id }
    });

    if (!order) {
      throw new AppError('Purchase order not found', 404);
    }

    if (order.status === 'received') {
      throw new AppError('Cannot update a received purchase order', 400);
    }

    return prisma.purchaseOrder.update({
      where: { id },
      data,
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
  }

  async receivePurchaseOrder(id: number) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUnique({
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
        throw new AppError('Purchase order not found', 404);
      }

      if (order.status === 'received') {
        throw new AppError('Purchase order already received', 400);
      }

      // Update stock for each item
      for (const item of order.items) {
        const stock = await tx.stock.findFirst({
          where: {
            productId: item.productId
          }
        });

        if (stock) {
          await tx.stock.update({
            where: { id: stock.id },
            data: {
              quantity: stock.quantity + item.quantity
            }
          });

          // Record stock movement
          await tx.stockMovement.create({
            data: {
              stockId: stock.id,
              movementType: 'IN',
              quantity: item.quantity,
              reason: `Purchase Order #${order.id} received`
            }
          });
        }
      }

      // Update order status
      return tx.purchaseOrder.update({
        where: { id },
        data: {
          status: 'received'
        },
        include: {
          supplier: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });
    });
  }

  async deletePurchaseOrder(id: number) {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id }
    });

    if (!order) {
      throw new AppError('Purchase order not found', 404);
    }

    if (order.status === 'received') {
      throw new AppError('Cannot delete a received purchase order', 400);
    }

    await prisma.purchaseOrder.delete({
      where: { id }
    });
  }
}