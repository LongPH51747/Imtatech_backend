require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
var logger = require('morgan');

const indexRouter = require('./routes/index');
var userRouter = require('./src/module/user/user.router');
const categoryRouter = require('./src/module/category/category.router');

const app = express();
const db = require('./src/config/db');

var cart = require('./src/module/cart/cart.router')
var product = require('./src/module/product/product.router')
var order = require('./src/module/order/order.router')
const swaggerSpec = require('./src/docs/swagger')
var plantaAPI = require('./src/module/planta_id/planta_api.router')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES
app.use('/', indexRouter);
app.use('/api/users', userRouter);
app.use('/api/categories', categoryRouter);

// DB connection

app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'], 
}));
db.connectDB();
app.use('/api/products', product)
app.use('/api/cart', cart)
app.use('/api/order', order)
app.use('/api', plantaAPI)
// catch 404 and forward to error handler
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Cung cap API docs

app.use((req, res, next) => {
  next(createError(404));
});
// error handler  
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
