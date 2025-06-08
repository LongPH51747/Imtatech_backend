var express = require('express');
var router = express.Router();

const userController = require('../src/module/controller/userController');
const authMiddleware = require('../middleware/authMiddleware');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

// Đăng ký
router.post('/register', userController.register);

// Đăng nhập
router.post('/login', userController.login);

// Profile - cần xác thực
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.delete('/profile', authMiddleware, userController.deleteProfile);

module.exports = router;
