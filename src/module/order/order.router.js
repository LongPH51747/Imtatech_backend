const express = require("express");
const router = express.Router();
const orderController = require("./order.contronller");

// router.post("/create/:userId", async (req, res) => {
//   await orderController2.create(req, res);
// });

router.post("/create", async (req, res) => {
  await orderController.create(req, res);
});

router.get("/get", async (req, res) => {
  await orderController.get(req, res);
});

router.patch("/updateStatus/:id", async (req, res) => {
  await orderController.updateStatus(req, res);
});

router.get("/getByUserId/:id", async (req, res) => {
  await orderController.getByUserId(req, res);
});

router.get("/getById/:id", async (req, res) => {
  await orderController.getById(req, res);
});

module.exports = router;

// SWAGGERUI

/**
 * @swagger
 * tags:
 *   - name: Order
 *     description: API order
 */

/**
 * @swagger
 * /api/order/create:
 *   post:
 *     summary: Tạo order
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     requestBody:
 *       required:
 *         - id_address
 *         - userId
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: 
 *               userId:
 *                 type: string
 *                 format: objectid
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: 
 *                     - id_product
 *                   properties:
 *                     id_product:
 *                       type: string
 *                       format: ObjectId
 *                     quantity:
 *                       type: number
 *               id_cart: 
 *                 type: string
 *                 format: ObjectId
 *               id_address: 
 *                 type: string
 *                 format: ObjectId
 *               payment_method:
 *                 type: string
 *     responses:
 *       200:
 *         description: User được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */

/**
 * @swagger
 * /api/order/get:
 *   get:
 *     summary: Lấy danh sách tất cả đơn hàng
 *     tags: [Order]
 *     responses:
 *       200:
 *         description: Danh sách Order
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */

/**
 * @swagger
 * /api/order/getByUserId/{id}:
 *   get:
 *     summary: Lấy order theo ID người dùng
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: order tương ứng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */

/**
 * @swagger
 * /api/order/getById/{id}:
 *   get:
 *     summary: Lấy order theo ID
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: order tương ứng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */

 /**
 * @swagger
 * /api/order/updateStatus/{id}:
 *   patch:
 *     summary: Cập nhật status order theo ID
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties: 
 *               status: 
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/order'
 */
