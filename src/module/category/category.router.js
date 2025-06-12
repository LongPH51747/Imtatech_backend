const express = require('express');
const router = express.Router();
const categoryController = require('./categoryController');
const authMiddleware = require('../../../middleware/authMiddleware');

// Danh mục cần đăng nhập để tạo/sửa/xóa
router.post('/', authMiddleware, categoryController.create);
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.put('/:id', authMiddleware, categoryController.update);
router.delete('/:id', authMiddleware, categoryController.remove);

module.exports = router;