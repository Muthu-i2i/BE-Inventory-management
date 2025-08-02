import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export class SupplierService {
  async getSuppliers(page: number = 1, pageSize: number = 10, search?: string) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = search ? {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    } : {};

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
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
      prisma.supplier.count({ where })
    ]);

    return {
      data: suppliers,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  async getSupplierById(id: number) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        products: true,
        purchaseOrders: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    return supplier;
  }

  async createSupplier(data: {
    name: string;
    email: string;
  }) {
    const { email } = data;

    // Check for duplicate email
    const existing = await prisma.supplier.findUnique({
      where: { email }
    });

    if (existing) {
      throw new AppError('Supplier with this email already exists', 400);
    }

    return prisma.supplier.create({
      data
    });
  }

  async updateSupplier(id: number, data: {
    name?: string;
    email?: string;
  }) {
    const supplier = await prisma.supplier.findUnique({
      where: { id }
    });

    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    if (data.email && data.email !== supplier.email) {
      const existing = await prisma.supplier.findUnique({
        where: { email: data.email }
      });

      if (existing) {
        throw new AppError('Email already in use by another supplier', 400);
      }
    }

    return prisma.supplier.update({
      where: { id },
      data
    });
  }

  async deleteSupplier(id: number) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
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
      throw new AppError(
        'Cannot delete supplier with existing products or purchase orders',
        400
      );
    }

    await prisma.supplier.delete({
      where: { id }
    });
  }

  async getSupplierStats(id: number) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            purchaseOrders: true
          }
        },
        purchaseOrders: {
          select: {
            status: true,
            items: {
              select: {
                quantity: true,
                unitPrice: true
              }
            }
          }
        }
      }
    });

    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    const totalOrders = supplier._count.purchaseOrders;
    const totalProducts = supplier._count.products;
    const totalSpent = supplier.purchaseOrders.reduce((sum, order) => 
      sum + order.items.reduce((orderSum, item) => 
        orderSum + (item.quantity * item.unitPrice), 0
      ), 0
    );

    const ordersByStatus = supplier.purchaseOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders,
      totalProducts,
      totalSpent,
      ordersByStatus
    };
  }
}