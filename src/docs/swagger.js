const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'S7M Backend API',
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
        url: 'http://192.168.1.209:5000',
      },
    ],
  },
  apis: ['./src/modules/**/*.js'], // sửa đúng path đến router nếu cần
};
const swaggerSpec = swaggerJSDoc(swaggerOptions)

module.exports = swaggerSpec