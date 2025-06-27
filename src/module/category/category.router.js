const express = require('express');
const router = express.Router();
const categoryController = require('./categoryController');
const authMiddleware = require('../../../middleware/authMiddleware');

// Danh mục cần đăng nhập để tạo/sửa/xóa
router.post('/create-category', categoryController.create);
router.get('/get-all-categories', categoryController.getAll);
router.get('/getById/:id', categoryController.getById);
router.put('/update/:id', categoryController.update);
router.delete('/delete-category-by-id/:id', categoryController.remove);

module.exports = router;

/**
 * @swagger
 * tags:
 *   - name: Category
 *     description: API quản lý Danh mục
 */

/**
 * @swagger
 * /api/categories/create-category:
 *   post:
 *     summary: Thêm danh mục mới
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Danh mục mới đã được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
 */

/**
 * @swagger
 * /api/categories/get-all-categories:
 *   get:
 *     summary: Lấy danh sách tất cả danh mục (không bao gồm ảnh)
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Danh sách danh mục sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */

/**
 * @swagger
 * /api/categories/delete-category-by-id/{id}:
 *   delete:
 *     summary: Xóa danh mục sản phẩm theo ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID danh mục cần xóa
 *     responses:
 *       200:
 *         description: Xóa danh mục thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Đã xóa danh mục
 *       404:
 *         description: Không tìm thấy danh mục
 */
