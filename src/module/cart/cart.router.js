const express = require('express')
const router = express.Router()
const cartContronller = require('./cart.contronller')

// router.post('/addToCart', async(req, res) => {
//     await cartContronller.addToCart(req, res)
// })

//test
router.post('/addToCart/:userId', async(req, res) => {
    await cartContronller.addToCart(req, res)
})

router.patch('/updateStatusToFalse/:id', async(req, res) => {
    await cartContronller.updateStatusToFalse(req, res)
})

router.patch('/updateStatusToTrue/:id_cartItem', async(req, res) => {
    await cartContronller.updateStatusToTrue(req, res)
})

router.delete('/deleteCartItem/:cartItemId', async(req, res) => {
    await cartContronller.removeCartItem(req, res)
})

router.patch("/updateQuantity/cartItemId/:id", async(req, res) => {
    await cartContronller.updateCartItemQuantity(req, res)
})

router.get('/getByUserId/:id', async(req, res) => {
    await cartContronller.getByUserId(req, res)
})

// router.delete('/deleteCartItem/:cartItemId', async(req, res) => {
//     await cartContronller.deleteCartItem(req, res)
// })

module.exports = router

/**
 * @swagger
 * tags:
 *   - name: Cart
 *     description: API cart
 */

/**
 * @swagger
 * /api/cart/getByUserId/{id}:
 *   get:
 *     summary: Lấy cart theo ID người dùng
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: cart tương ứng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */

/**
 * @swagger
 * /api/cart/addToCart/{userId}:
 *   post:
 *     summary: Thêm sản phẩm vào giỏ hàng
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
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
 *             properties:
 *               cartItem:
 *                 type: object
 *                 required:
 *                   - id_product
 *                 properties:
 *                   id_product:
 *                     type: string
 *                   quantity:
 *                     type: number
 *                     default: 1
 *     responses:
 *       201:
 *         description: Thêm sản phẩm vào giỏ hàng thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */

/**
 * @swagger
 * /api/cart/updateStatusToFalse/id_cartItem/{id}:
 *   patch:
 *     summary: Cập nhật status của cartItem thành false theo ID
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id_cartItem
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của cartItem cần cập nhật
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */

 /**
 * @swagger
 * /api/cart/updateStatusToTrue/id_cartItem/{id}:
 *   patch:
 *     summary: Cập nhật status cart to true theo ID
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id_cartItem
 *         required: true
 *         schema:
 *           type: string
 *         description: ID cart
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */

 /**
 * @swagger
 * /api/cart/updateQuantity/cartItemId/{id}:
 *   patch:
 *     summary: Cập nhật quantity cart theo ID
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               quantity:
 *                 type: number
 *               userId: 
 *                 type: string
 *                 format: objectid
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */

/**
 * @swagger
 * /api/cart/deleteCartItem/{id}:
 *   delete:
 *     summary: Xoá cart item theo ID
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID cart item
 *     requestBody:
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   userId: 
 *                     type: string
 *                     format: objectid
 *     responses:
 *       200:
 *         description: Xoá thành công
 */
