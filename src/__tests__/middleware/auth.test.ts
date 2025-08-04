import { Request, Response } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import jwt from 'jsonwebtoken';
import { AppError } from '../../middleware/errorHandler';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      user: undefined
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('authenticate', () => {
    it('should call next with error if no token provided', async () => {
      mockRequest.headers = {};

      authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(AppError)
      );
    });

    it('should call next with error for invalid token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(AppError)
      );
    });

    it('should set user and call next for valid token', async () => {
      const mockUser = { userId: 1, role: 'admin' };
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should call next with error if user not in request', async () => {
      mockRequest.user = undefined;

      const middleware = authorize('admin');
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(AppError)
      );
    });

    it('should call next with error if user role not allowed', async () => {
      mockRequest.user = { userId: 1, role: 'user' };

      const middleware = authorize('admin');
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(AppError)
      );
    });

    it('should call next if user role is allowed', async () => {
      mockRequest.user = { userId: 1, role: 'admin' };

      const middleware = authorize('admin', 'manager');
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });
});