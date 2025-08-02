import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export class WarehouseService {
  async getWarehouses(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [warehouses, total] = await Promise.all([
      prisma.warehouse.findMany({
        skip,
        take,
        include: {
          locations: true,
          _count: {
            select: {
              stocks: true,
              products: true
            }
          }
        }
      }),
      prisma.warehouse.count()
    ]);

    return {
      data: warehouses,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  async getWarehouseById(id: number) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        locations: {
          include: {
            stocks: {
              include: {
                product: true
              }
            }
          }
        },
        products: true
      }
    });

    if (!warehouse) {
      throw new AppError('Warehouse not found', 404);
    }

    return warehouse;
  }

  async createWarehouse(data: {
    name: string;
    capacity: number;
    address: string;
  }) {
    const { name, capacity, address } = data;

    if (!name || !capacity || !address) {
      throw new AppError('Missing required fields', 400);
    }

    return prisma.warehouse.create({
      data: {
        name,
        capacity,
        address
      },
      include: {
        locations: true
      }
    });
  }

  async updateWarehouse(id: number, data: {
    name?: string;
    capacity?: number;
    address?: string;
  }) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id }
    });

    if (!warehouse) {
      throw new AppError('Warehouse not found', 404);
    }

    return prisma.warehouse.update({
      where: { id },
      data,
      include: {
        locations: true
      }
    });
  }

  async deleteWarehouse(id: number) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            stocks: true,
            locations: true
          }
        }
      }
    });

    if (!warehouse) {
      throw new AppError('Warehouse not found', 404);
    }

    if (warehouse._count.products > 0 || warehouse._count.stocks > 0) {
      throw new AppError('Cannot delete warehouse with existing products or stock', 400);
    }

    await prisma.warehouse.delete({
      where: { id }
    });
  }

  // Location management
  async addLocation(warehouseId: number, name: string) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId }
    });

    if (!warehouse) {
      throw new AppError('Warehouse not found', 404);
    }

    return prisma.location.create({
      data: {
        name,
        warehouseId
      }
    });
  }

  async removeLocation(locationId: number) {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        _count: {
          select: {
            stocks: true
          }
        }
      }
    });

    if (!location) {
      throw new AppError('Location not found', 404);
    }

    if (location._count.stocks > 0) {
      throw new AppError('Cannot delete location with existing stock', 400);
    }

    await prisma.location.delete({
      where: { id: locationId }
    });
  }
}