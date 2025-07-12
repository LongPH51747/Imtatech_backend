const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Planta Backend API',
      version: '1.0.0',
      description: 'Anh em mình cứ thế thôi hẹ hẹ hẹ hẹ.......',
    },
    comonents:{
        securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security:[
      {
        bearerAuth: []
      }
    ],
    servers: [
      {
        url: 'https://3c23700d5553.ngrok-free.app',
      },
      {
        url: 'http://localhost:5000',
      },
    ],
  },
  apis: ['./src/module/**/*.js'], // sửa đúng path đến router nếu cần
};
const swaggerSpec = swaggerJSDoc(swaggerOptions)

module.exports = swaggerSpec