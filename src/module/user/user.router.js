var express = require("express");
var router = express.Router();

const userController = require("./user.controller");
const authMiddleware = require("../../../middleware/authMiddleware");

/* GET users listing. */
router.get("/getAllUser", userController.getAllUser);

router.post("/register", userController.register);

router.post("/login", userController.login);

router.post("/login-admin", userController.loginAdmin);

router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", authMiddleware, userController.updateProfile);
router.delete("/profile", authMiddleware, userController.deleteProfile);
router.patch("/update-status-user/:id", userController.updateStatusUser); // Cap nhat trang thai user
router.delete("/delete-by-id/:id", userController.deleteUser); // Xoa user theo ID
router.post("/change-password", authMiddleware, userController.changePassword);
router.patch('/change-avatar', authMiddleware, userController.changeAvata)
module.exports = router;

/**
 * @swagger
 * /api/users/getAllUser:
 *   get:
 *     summary: Test API hoặc lấy danh sách users (demo)
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Kết quả trả về mặc định
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: respond with a resource
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dữ liệu không hợp lệ
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Sai thông tin đăng nhập
 */

/**
 * @swagger
 * /api/users/login-admin:
 *   post:
 *     summary: Đăng nhập tài khoản admin
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Đăng nhập admin thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Sai thông tin đăng nhập hoặc không phải admin
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Lấy thông tin cá nhân (cần xác thực)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Lỗi xác thực hoặc không tìm thấy user
 *
 *   put:
 *     summary: Cập nhật thông tin cá nhân (cần xác thực)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Lỗi xác thực hoặc dữ liệu không hợp lệ
 *
 *   delete:
 *     summary: Xóa tài khoản cá nhân (cần xác thực)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tài khoản đã bị xóa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Lỗi xác thực hoặc không tìm thấy user
 */

/**
 * @swagger
 * /api/users/update-status-user/{id}:
 *   patch:
 *     summary: Cập nhật trạng thái sản người dùng (còn phép truy cập / không cho phép truy cập)
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_allowed
 *             properties:
 *               is_allowed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       404:
 *         description: Không tìm thấy người dùng
 */

/**
 * @swagger
 * /api/users/delete-by-id/id/{id}:
 *   delete:
 *     summary: Xoá người dùng theo ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Xoá thành công
 */

/**
 * @swagger
 * /user/change-password:
 *   post:
 *     summary: Đổi mật khẩu (cần xác thực)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *             required:
 *               - oldPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Lỗi xác thực hoặc dữ liệu không hợp lệ
 */

/**
 * @swagger
 * /api/users/change-avatar/:
 *   patch:
 *     summary: Cập nhật ảnh người dùng 
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 description: truyền thẳng cái ảnh khi mà lấy từ điện thoại vào (không phải file)
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       404:
 *         description: Không tìm thấy người dùng
 */