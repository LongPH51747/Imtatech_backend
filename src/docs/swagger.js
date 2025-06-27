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
        url: 'https://237c-2405-4802-1f1-bb30-50e4-dcbd-8208-20df.ngrok-free.app',
      },
    ],
  },
  apis: ['./src/module/**/*.js'], // sửa đúng path đến router nếu cần
};
const swaggerSpec = swaggerJSDoc(swaggerOptions)

module.exports = swaggerSpec