import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inventory Management System API',
      version: '1.0.0',
      description: 'API documentation for Inventory Management System',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      { url: process.env.SWAGGER_SERVER_URL || 'http://localhost:5000' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.ts'] // Path to the API routes
};

export const specs = swaggerJsdoc(options);