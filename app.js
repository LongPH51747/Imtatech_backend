require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
var logger = require('morgan');
const http = require('http');

// Import routes
const indexRouter = require('./routes/index');
const userRouter = require('./src/module/user/user.router');
const categoryRouter = require('./src/module/category/category.router');
const cartRouter = require('./src/module/cart/cart.router');
const productRouter = require('./src/module/product/product.router');
const orderRouter = require('./src/module/order/order.router');
const chatRouter = require('./src/module/chat/chat.route');
const messageRouter = require('./src/module/messages/message.route');
const plantaAPIRouter = require('./src/module/planta_id/planta_api.router');

// Import configurations
const db = require('./src/config/db');
const swaggerSpec = require('./src/docs/swagger');

// Import Socket Manager
const SocketManager = require('./src/socket/socket');

const app = express();
const server = http.createServer(app);

// Khởi tạo Socket Manager
const socketManager = new SocketManager(server);

// Lưu socketManager vào app để sử dụng ở nơi khác
app.set('socketManager', socketManager);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

// Database connection
db.connectDB();

// API Routes
app.use('/', indexRouter);
app.use('/api/users', userRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/chat', chatRouter);
app.use('/api/messages', messageRouter);
app.use('/api', plantaAPIRouter);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "ImtaTech API Documentation"
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server đang hoạt động bình thường',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Socket status endpoint
app.get('/socket-status', (req, res) => {
  const socketManager = req.app.get('socketManager');
  res.status(200).json({
    onlineUsers: socketManager.getOnlineCount(),
    connectedUsers: socketManager.getOnlineUsers()
  });
});

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404, 'API endpoint không tồn tại'));
});

// Error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Log error
  console.error('Error:', err);

  // Handle API errors
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      error: {
        message: err.message || 'Lỗi server nội bộ',
        status: err.status || 500,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Handle view errors
  res.status(err.status || 500);
  res.render('error');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = { app, server };
