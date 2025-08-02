import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { AppError } from '../errorHandler';

type ValidationSource = 'body' | 'query' | 'params';

export const validate = (schema: Schema, source: ValidationSource = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[source];

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');

      return next(new AppError(errorMessage, 400));
    }

    // Replace request data with validated data
    req[source] = value;
    return next();
  };
};