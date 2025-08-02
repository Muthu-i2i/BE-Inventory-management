import { prisma } from '../lib/prisma';

export class ReportService {
  async getInventoryValueReport() {
    const stocks = await prisma.stock.findMany({
      include: {
        product: true
      }
    });

    const totalValue = stocks.reduce((sum, stock) => 
      sum + (stock.quantity * stock.product.unitPrice), 0
    );

    const valueByWarehouse = await prisma.warehouse.findMany({
      include: {
        stocks: {
          include: {
            product: true
          }
        }
      }
    }).then(warehouses => 
      warehouses.map(warehouse => ({
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        totalValue: warehouse.stocks.reduce((sum, stock) => 
          sum + (stock.quantity * stock.product.unitPrice), 0
        )
      }))
    );

    return {
      totalValue,
      valueByWarehouse
    };
  }

  async getLowStockReport(threshold: number = 10) {
    return prisma.stock.findMany({
      where: {
        quantity: {
          lte: threshold
        }
      },
      include: {
        product: true,
        warehouse: true,
        location: true
      }
    });
  }

  async getStockMovementReport(startDate: Date, endDate: Date) {
    const movements = await prisma.stockMovement.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        stock: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const summary = movements.reduce((acc, movement) => {
      const type = movement.movementType;
      acc[type] = acc[type] || { count: 0, totalQuantity: 0 };
      acc[type].count++;
      acc[type].totalQuantity += movement.quantity;
      return acc;
    }, {} as Record<string, { count: number; totalQuantity: number }>);

    return {
      movements,
      summary
    };
  }

  async getSalesReport(startDate: Date, endDate: Date) {
    const orders = await prisma.salesOrder.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
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

    const totalSales = orders.reduce((sum, order) => 
      sum + order.items.reduce((orderSum, item) => 
        orderSum + (item.quantity * item.unitPrice), 0
      ), 0
    );

    const productSales = orders.reduce((acc, order) => {
      order.items.forEach(item => {
        acc[item.productId] = acc[item.productId] || {
          productName: item.product.name,
          quantity: 0,
          revenue: 0
        };
        acc[item.productId].quantity += item.quantity;
        acc[item.productId].revenue += item.quantity * item.unitPrice;
      });
      return acc;
    }, {} as Record<number, { productName: string; quantity: number; revenue: number }>);

    return {
      totalSales,
      productSales: Object.values(productSales),
      orderCount: orders.length
    };
  }

  async getPurchaseReport(startDate: Date, endDate: Date) {
    const orders = await prisma.purchaseOrder.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
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

    const totalPurchases = orders.reduce((sum, order) => 
      sum + order.items.reduce((orderSum, item) => 
        orderSum + (item.quantity * item.unitPrice), 0
      ), 0
    );

    const supplierPurchases = orders.reduce((acc, order) => {
      acc[order.supplierId] = acc[order.supplierId] || {
        supplierName: order.supplier.name,
        orderCount: 0,
        totalAmount: 0
      };
      acc[order.supplierId].orderCount++;
      acc[order.supplierId].totalAmount += order.items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0
      );
      return acc;
    }, {} as Record<number, { supplierName: string; orderCount: number; totalAmount: number }>);

    return {
      totalPurchases,
      supplierPurchases: Object.values(supplierPurchases),
      orderCount: orders.length
    };
  }

  async getWarehouseUtilizationReport() {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        locations: {
          include: {
            stocks: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    return warehouses.map(warehouse => {
      const totalItems = warehouse.locations.reduce((sum, location) => 
        sum + location.stocks.reduce((locSum, stock) => locSum + stock.quantity, 0), 0
      );

      const utilizationRate = (totalItems / warehouse.capacity) * 100;

      return {
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        capacity: warehouse.capacity,
        totalItems,
        utilizationRate,
        locationCount: warehouse.locations.length
      };
    });
  }
}