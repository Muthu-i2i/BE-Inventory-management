import { Request, Response } from 'express';
import { login, register } from '../../controllers/auth.controller';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../../middleware/errorHandler';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn()
    }
  }
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw error for invalid credentials', async () => {
      mockRequest.body = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(AppError)
      );
    });

    it('should return token for valid credentials', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        hashedPassword: 'hashedpass',
        role: 'user'
      };

      mockRequest.body = {
        username: 'testuser',
        password: 'correctpassword'
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mocktoken');

      await login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        access: 'mocktoken',
        user: {
          id: mockUser.id,
          username: mockUser.username,
          role: mockUser.role
        }
      });
    });
  });

  describe('register', () => {
    it('should throw error if username exists', async () => {
      mockRequest.body = {
        username: 'existinguser',
        password: 'password123'
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'existinguser'
      });

      await register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(AppError)
      );
    });

    it('should create new user and return token', async () => {
      const mockUser = {
        id: 1,
        username: 'newuser',
        role: 'user'
      };

      mockRequest.body = {
        username: 'newuser',
        password: 'password123'
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mocktoken');

      await register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        access: 'mocktoken',
        user: {
          id: mockUser.id,
          username: mockUser.username,
          role: mockUser.role
        }
      });
    });
  });
});