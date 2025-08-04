# Security Documentation

## Authentication Security

### Password Hashing
```typescript
// src/utils/password.ts
import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12); // Higher rounds for better security
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
```

### JWT Configuration
```typescript
// src/config/jwt.ts
import jwt from 'jsonwebtoken';

export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  algorithm: 'HS256' as const,
  issuer: 'inventory-system',
  audience: 'inventory-api'
};

export const generateTokens = (userId: number, role: string) => {
  const payload = {
    userId,
    role,
    type: 'access'
  };

  const accessToken = jwt.sign(payload, jwtConfig.secret!, {
    expiresIn: jwtConfig.accessTokenExpiry,
    algorithm: jwtConfig.algorithm,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience
  });

  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    jwtConfig.secret!,
    {
      expiresIn: jwtConfig.refreshTokenExpiry,
      algorithm: jwtConfig.algorithm,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }
  );

  return { accessToken, refreshToken };
};
```

## Data Protection

### Request Validation
```typescript
// src/middleware/validate.ts
import { body, param, query } from 'express-validator';

export const productValidation = {
  create: [
    body('name').trim().notEmpty().escape(),
    body('sku').trim().notEmpty().matches(/^[A-Z0-9-]+$/),
    body('price').isFloat({ min: 0 }),
    body('quantity').isInt({ min: 0 })
  ],
  update: [
    param('id').isInt({ min: 1 }),
    body('name').optional().trim().notEmpty().escape(),
    body('price').optional().isFloat({ min: 0 }),
    body('quantity').optional().isInt({ min: 0 })
  ]
};
```

### SQL Injection Prevention
```typescript
// Using Prisma ORM for type-safe queries
import { prisma } from '../lib/prisma';

export class ProductService {
  async findByCategory(categoryId: number) {
    // Safe from SQL injection as Prisma handles parameter sanitization
    return prisma.product.findMany({
      where: {
        categoryId
      },
      include: {
        category: true,
        supplier: true
      }
    });
  }
}
```

## Rate Limiting

### API Rate Limiting
```typescript
// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const createRateLimiter = (
  windowMs: number,
  max: number,
  keyPrefix: string
) => {
  return rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: keyPrefix
    }),
    windowMs,
    max,
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later.'
      }
    }
  });
};

export const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'rl:auth:'
);

export const apiLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  100, // 100 requests
  'rl:api:'
);
```

## Audit Logging

### Audit Trail Implementation
```typescript
// src/services/audit.ts
import { prisma } from '../lib/prisma';

export interface AuditLogData {
  action: string;
  entity: string;
  entityId: number;
  userId: number;
  details: object;
}

export class AuditService {
  async log(data: AuditLogData) {
    return prisma.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        userId: data.userId,
        details: JSON.stringify(data.details)
      }
    });
  }

  async getAuditTrail(
    entity: string,
    entityId: number,
    startDate?: Date,
    endDate?: Date
  ) {
    return prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
  }
}
```

## Security Headers

### Helmet Configuration
```typescript
// src/config/security.ts
import helmet from 'helmet';

export const securityMiddleware = [
  helmet(),
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }),
  helmet.referrerPolicy({ policy: 'same-origin' })
];
```

## CORS Configuration

### CORS Setup
```typescript
// src/config/cors.ts
import cors from 'cors';

export const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
```

## Error Handling

### Security Error Handling
```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export const securityErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof JsonWebTokenError) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired'
        }
      });
    }
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid access token'
      }
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }

  next(error);
};
```

## Security Best Practices

1. **Environment Variables**
   - Use `.env` for sensitive configuration
   - Never commit secrets to version control
   - Rotate secrets regularly

2. **Input Validation**
   - Validate all input data
   - Sanitize user input
   - Use parameterized queries

3. **Authentication**
   - Implement password complexity rules
   - Use secure session management
   - Implement account lockout

4. **Authorization**
   - Implement role-based access control
   - Validate permissions for each request
   - Use principle of least privilege

5. **Data Protection**
   - Encrypt sensitive data at rest
   - Use HTTPS for all communications
   - Implement proper backup strategies

6. **Logging**
   - Log security events
   - Implement audit trails
   - Monitor for suspicious activity

7. **Error Handling**
   - Don't expose internal errors
   - Log errors securely
   - Return appropriate error responses