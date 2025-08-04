# AI Prompt Library

## Database Design Prompts

### Prompt 1: Schema Generation
**Prompt**: "Design a PostgreSQL database schema for an inventory management system with the following requirements:
- Product management with categories and suppliers
- Stock tracking across multiple warehouses and locations
- Purchase order and sales order management
- Stock movement and adjustment tracking
- Audit logging for all operations"

**Context**: Initial system design phase
**Output Quality**: 9/10
**Iterations**: 2
**Final Result**: Comprehensive Prisma schema with all required entities and relationships

### Prompt 2: API Design
**Prompt**: "Create Express.js API endpoints for inventory management with:
- CRUD operations for products
- Stock movement tracking
- Purchase and sales order processing
- Role-based access control
Include TypeScript types, validation, and error handling."

**Context**: API development phase
**Output Quality**: 8/10
**Modifications**: Added additional validation rules and error handling

## Code Generation Prompts

### Prompt 3: Authentication Implementation
**Prompt**: "Implement JWT authentication in Express.js with:
- User registration and login
- Role-based middleware
- Password hashing with bcrypt
- Refresh token mechanism
Include TypeScript types and error handling."

**Context**: Security implementation
**Output Quality**: 9/10
**Iterations**: 1
**Final Result**: Secure authentication system with proper error handling

### Prompt 4: Frontend Components
**Prompt**: "Create React components for inventory management:
- Product list with filtering and pagination
- Stock movement form with validation
- Dashboard with summary statistics
Use Material-UI and TypeScript."

**Context**: UI development
**Output Quality**: 8/10
**Modifications**: Enhanced error handling and loading states

## Problem-Solving Prompts

### Prompt 5: Performance Optimization
**Prompt**: "Optimize database queries for product listing with:
- Efficient joins for related data
- Proper indexing
- Pagination support
- Caching strategy
Show Prisma query implementation."

**Context**: Performance tuning
**Output Quality**: 9/10
**Impact**: 60% reduction in query time

### Prompt 6: State Management
**Prompt**: "Design Redux state management for:
- Product inventory
- Order processing
- User authentication
Include actions, reducers, and selectors with TypeScript."

**Context**: Frontend architecture
**Output Quality**: 8/10
**Modifications**: Added error handling and loading states

## Testing Prompts

### Prompt 7: API Testing
**Prompt**: "Generate Jest test cases for inventory API:
- Product CRUD operations
- Stock movement validation
- Order processing logic
Include edge cases and error scenarios."

**Context**: Backend testing
**Output Quality**: 9/10
**Coverage**: 85% code coverage

### Prompt 8: Component Testing
**Prompt**: "Create React Testing Library tests for:
- Product form validation
- Stock movement workflow
- Error handling scenarios
Include user interaction testing."

**Context**: Frontend testing
**Output Quality**: 8/10
**Coverage**: 80% component coverage

## Documentation Prompts

### Prompt 9: API Documentation
**Prompt**: "Generate OpenAPI documentation for:
- All API endpoints
- Request/response schemas
- Authentication requirements
- Error responses
Include examples and descriptions."

**Context**: Documentation
**Output Quality**: 9/10
**Completeness**: Full API coverage

### Prompt 10: Deployment Guide
**Prompt**: "Create deployment documentation for:
- Environment setup
- Database migration
- Application configuration
- Monitoring setup
Include security considerations."

**Context**: DevOps
**Output Quality**: 8/10
**Completeness**: Comprehensive deployment guide

## Best Practices

### Effective Prompt Patterns
1. Be specific about requirements
2. Include context and constraints
3. Request examples and edge cases
4. Specify output format
5. Ask for error handling

### Prompt Refinement Process
1. Start with high-level requirements
2. Iterate based on output quality
3. Add specific constraints
4. Request optimizations
5. Validate against best practices

### Quality Validation
1. Code review guidelines
2. Testing requirements
3. Performance metrics
4. Security checklist
5. Documentation standards