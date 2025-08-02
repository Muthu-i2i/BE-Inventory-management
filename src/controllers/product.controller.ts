import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { AuthenticatedRequest } from '../types/route.types';

const productService = new ProductService();

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, page_size, search } = req.query;
    const result = await productService.getProducts(
      parseInt(page as string) || 1,
      parseInt(page_size as string) || 10,
      search as string
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(parseInt(id));
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(parseInt(id), req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(parseInt(id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};