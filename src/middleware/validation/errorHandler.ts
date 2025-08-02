import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'joi';
import { AppError } from '../errorHandler';

export const validationErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle Joi validation errors
  if (err instanceof ValidationError) {
    const errorDetails = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errorDetails
    });
  }

  // Pass other errors to the main error handler
  next(err);
};