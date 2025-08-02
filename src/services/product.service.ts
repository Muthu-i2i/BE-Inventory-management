import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export class ProductService {
  async getProducts(page: number = 1, pageSize: number = 10, search?: string) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = search ? {
      OR: [
        { name: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } }
      ]
    } : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
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
      }),
      prisma.product.count({ where })
    ]);

    return {
      data: products,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  async getProductById(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        warehouse: true,
        stocks: {
          include: {
            location: true,
            movements: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 10
            }
          }
        }
      }
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  async createProduct(data: {
    name: string;
    sku: string;
    barcode: string;
    categoryId: number;
    supplierId: number;
    warehouseId: number;
    unitPrice: number;
    price: number;
  }) {
    const { sku, barcode } = data;

    // Check for duplicate SKU or barcode
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { sku },
          { barcode }
        ]
      }
    });

    if (existing) {
      throw new AppError(
        `Product with same ${existing.sku === sku ? 'SKU' : 'barcode'} already exists`,
        400
      );
    }

    // Validate relationships
    const [category, supplier, warehouse] = await Promise.all([
      prisma.category.findUnique({ where: { id: data.categoryId } }),
      prisma.supplier.findUnique({ where: { id: data.supplierId } }),
      prisma.warehouse.findUnique({ where: { id: data.warehouseId } })
    ]);

    if (!category) throw new AppError('Category not found', 400);
    if (!supplier) throw new AppError('Supplier not found', 400);
    if (!warehouse) throw new AppError('Warehouse not found', 400);

    return prisma.product.create({
      data,
      include: {
        category: true,
        supplier: true,
        warehouse: true
      }
    });
  }

  async updateProduct(id: number, data: {
    name?: string;
    unitPrice?: number;
    price?: number;
    categoryId?: number;
    supplierId?: number;
    warehouseId?: number;
  }) {
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Validate relationships if they're being updated
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId }
      });
      if (!category) throw new AppError('Category not found', 400);
    }

    if (data.supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: data.supplierId }
      });
      if (!supplier) throw new AppError('Supplier not found', 400);
    }

    if (data.warehouseId) {
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: data.warehouseId }
      });
      if (!warehouse) throw new AppError('Warehouse not found', 400);
    }

    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        supplier: true,
        warehouse: true
      }
    });
  }

  async deleteProduct(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            stocks: true,
            purchaseItems: true,
            salesItems: true
          }
        }
      }
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (
      product._count.stocks > 0 ||
      product._count.purchaseItems > 0 ||
      product._count.salesItems > 0
    ) {
      throw new AppError(
        'Cannot delete product with existing stock or order history',
        400
      );
    }

    await prisma.product.delete({
      where: { id }
    });
  }

  async getProductStock(id: number) {
    const stocks = await prisma.stock.findMany({
      where: { productId: id },
      include: {
        location: {
          include: {
            warehouse: true
          }
        }
      }
    });

    return {
      totalQuantity: stocks.reduce((sum, stock) => sum + stock.quantity, 0),
      stocks
    };
  }
}