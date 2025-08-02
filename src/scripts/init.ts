import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const users = await prisma.user.createMany({
      data: [
        {
          username: 'admin',
          hashedPassword,
          role: 'admin'
        },
        {
          username: 'manager',
          hashedPassword: await bcrypt.hash('manager123', 10),
          role: 'manager'
        },
        {
          username: 'user',
          hashedPassword: await bcrypt.hash('user123', 10),
          role: 'user'
        }
      ]
    });
    console.log('Created users:', users);

    // Create categories
    const categories = await prisma.category.createMany({
      data: [
        { name: 'Electronics' },
        { name: 'Furniture' },
        { name: 'Office Supplies' },
        { name: 'Networking' },
        { name: 'Storage' }
      ]
    });
    console.log('Created categories:', categories);

    // Create suppliers
    const suppliers = await prisma.supplier.createMany({
      data: [
        { name: 'Dell Inc', email: 'dell@example.com' },
        { name: 'HP Inc', email: 'hp@example.com' },
        { name: 'Office Depot', email: 'officedepot@example.com' },
        { name: 'Cisco Systems', email: 'cisco@example.com' }
      ]
    });
    console.log('Created suppliers:', suppliers);

    // Create warehouses
    const warehouses = await prisma.warehouse.createMany({
      data: [
        { 
          name: 'Main Warehouse',
          capacity: 1000,
          address: '123 Main St, City'
        },
        {
          name: 'Electronics Warehouse',
          capacity: 500,
          address: '456 Tech Ave, City'
        },
        {
          name: 'Furniture Warehouse',
          capacity: 2000,
          address: '789 Storage Blvd, City'
        }
      ]
    });
    console.log('Created warehouses:', warehouses);

    // Create locations for each warehouse
    const mainWarehouse = await prisma.warehouse.findFirst({
      where: { name: 'Main Warehouse' }
    });

    if (mainWarehouse) {
      const locations = await prisma.location.createMany({
        data: [
          { name: 'Section A1', warehouseId: mainWarehouse.id },
          { name: 'Section A2', warehouseId: mainWarehouse.id },
          { name: 'Section B1', warehouseId: mainWarehouse.id },
          { name: 'Section B2', warehouseId: mainWarehouse.id }
        ]
      });
      console.log('Created locations:', locations);
    }

    // Create sample products
    const electronicsCategory = await prisma.category.findFirst({
      where: { name: 'Electronics' }
    });
    const dellSupplier = await prisma.supplier.findFirst({
      where: { name: 'Dell Inc' }
    });

    if (electronicsCategory && dellSupplier && mainWarehouse) {
      const products = await prisma.product.createMany({
        data: [
          {
            name: 'Dell Laptop XPS 13',
            sku: 'DELL-LAP-001',
            barcode: '1234567890123',
            categoryId: electronicsCategory.id,
            supplierId: dellSupplier.id,
            warehouseId: mainWarehouse.id,
            unitPrice: 800,
            price: 1200
          },
          {
            name: 'Dell Desktop OptiPlex',
            sku: 'DELL-DSK-001',
            barcode: '1234567890124',
            categoryId: electronicsCategory.id,
            supplierId: dellSupplier.id,
            warehouseId: mainWarehouse.id,
            unitPrice: 600,
            price: 900
          }
        ]
      });
      console.log('Created products:', products);

      // Declare laptop variable in outer scope
      let laptop: any = null;

      // Create initial stock
      const location = await prisma.location.findFirst({
        where: { name: 'Section A1' }
      });

      if (location) {
        laptop = await prisma.product.findFirst({
          where: { sku: 'DELL-LAP-001' }
        });

        if (laptop) {
          const stock = await prisma.stock.create({
            data: {
              productId: laptop.id,
              warehouseId: mainWarehouse.id,
              locationId: location.id,
              quantity: 50
            }
          });
          console.log('Created initial stock:', stock);

          // Create sample stock movement
          const movement = await prisma.stockMovement.create({
            data: {
              stockId: stock.id,
              movementType: 'IN',
              quantity: 50,
              reason: 'Initial stock'
            }
          });
          console.log('Created stock movement:', movement);
        }
      }

      // Create sample purchase order
      if (laptop) {
        const purchaseOrder = await prisma.purchaseOrder.create({
          data: {
            supplierId: dellSupplier.id,
            status: 'open',
            items: {
              create: [
                {
                  productId: laptop.id,
                  quantity: 10,
                  unitPrice: 800
                }
              ]
            }
          }
        });
        console.log('Created purchase order:', purchaseOrder);
      }
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error during initialization:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });