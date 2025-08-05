import { Request, Response } from 'express';
import * as productController from '../../controllers/product.controller';
import { ProductService } from '../../services/product.service';
import { AuthenticatedRequest } from '../../types/route.types';

// Mock ProductService
jest.mock('../../services/product.service');

describe('Product Controller', () => {
  let mockRequest: Partial<Request & AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockProductService: jest.Mocked<ProductService>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {}
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    mockNext = jest.fn();
    mockProductService = new ProductService() as jest.Mocked<ProductService>;
    (ProductService as jest.Mock).mockImplementation(() => mockProductService);
  });

  describe('getProducts', () => {
    it('should return paginated products', async () => {
      const mockResult = {
        data: [
          {
            id: 1,
            name: 'Product 1',
            sku: 'SKU-001',
            barcode: 'BAR-001',
            categoryId: 1,
            supplierId: 1,
            warehouseId: 1,
            unitPrice: 10,
            price: 15,
            category: { id: 1, name: 'Category 1' },
            supplier: { id: 1, name: 'Supplier 1', email: 'supplier@test.com' },
            warehouse: { id: 1, name: 'Warehouse 1', capacity: 1000, address: 'Address 1' },
            stocks: [{
              id: 1,
              productId: 1,
              warehouseId: 1,
              locationId: 1,
              quantity: 10,
              location: {
                id: 1,
                name: 'Location 1',
                warehouseId: 1
              }
            }]
          }
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 1,
          totalPages: 1
        }
      };

      mockRequest.query = {
        page: '1',
        page_size: '10'
      };

      mockProductService.getProducts.mockResolvedValue(mockResult);

      await productController.getProducts(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockProductService.getProducts).toHaveBeenCalledWith(1, 10, undefined);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('getProduct', () => {
    it('should return product by id', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        sku: 'SKU-001',
        barcode: 'BAR-001',
        categoryId: 1,
        supplierId: 1,
        warehouseId: 1,
        unitPrice: 10,
        price: 15,
        category: { id: 1, name: 'Category 1' },
        supplier: { id: 1, name: 'Supplier 1', email: 'supplier@test.com' },
        warehouse: { id: 1, name: 'Warehouse 1', capacity: 1000, address: 'Address 1' },
        stocks: [{
          id: 1,
          productId: 1,
          warehouseId: 1,
          locationId: 1,
          quantity: 10,
          location: {
            id: 1,
            name: 'Location 1',
            warehouseId: 1
          },
          movements: [{
            id: 1,
            createdAt: new Date(),
            quantity: 10,
            movementType: 'IN',
            reason: 'Initial stock',
            stockId: 1
          }]
        }]
      };

      mockRequest.params = { id: '1' };
      mockProductService.getProductById.mockResolvedValue(mockProduct);

      await productController.getProduct(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockProductService.getProductById).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const mockProduct = {
        name: 'Test Product',
        sku: 'TEST-001',
        barcode: 'BAR-001',
        categoryId: 1,
        supplierId: 1,
        warehouseId: 1,
        unitPrice: 10,
        price: 15
      };

      const mockCreatedProduct = {
        id: 1,
        ...mockProduct,
        category: { id: 1, name: 'Category 1' },
        supplier: { id: 1, name: 'Supplier 1', email: 'supplier@test.com' },
        warehouse: { id: 1, name: 'Warehouse 1', capacity: 1000, address: 'Address 1' }
      };

      mockRequest.body = mockProduct;
      mockProductService.createProduct.mockResolvedValue(mockCreatedProduct);

      await productController.createProduct(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockProductService.createProduct).toHaveBeenCalledWith(mockProduct);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedProduct);
    });
  });

  describe('updateProduct', () => {
    it('should update product', async () => {
      const mockProduct = {
        id: 1,
        name: 'Updated Product',
        sku: 'TEST-001',
        barcode: 'BAR-001',
        categoryId: 1,
        supplierId: 1,
        warehouseId: 1,
        unitPrice: 10,
        price: 15,
        category: { id: 1, name: 'Category 1' },
        supplier: { id: 1, name: 'Supplier 1', email: 'supplier@test.com' },
        warehouse: { id: 1, name: 'Warehouse 1', capacity: 1000, address: 'Address 1' }
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Updated Product' };
      mockProductService.updateProduct.mockResolvedValue(mockProduct);

      await productController.updateProduct(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockProductService.updateProduct).toHaveBeenCalledWith(1, { name: 'Updated Product' });
      expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product', async () => {
      mockRequest.params = { id: '1' };
      mockProductService.deleteProduct.mockResolvedValue(undefined);

      await productController.deleteProduct(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockProductService.deleteProduct).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });
});