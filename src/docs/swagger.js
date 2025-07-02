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
        url: 'https://1e35-2405-4803-fbc1-b6a0-ec58-d662-bf8d-f9a5.ngrok-free.app',
      },
    ],
  },
  apis: ['./src/module/**/*.js'], // sửa đúng path đến router nếu cần
};
const swaggerSpec = swaggerJSDoc(swaggerOptions)

module.exports = swaggerSpec