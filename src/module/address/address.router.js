const express = require('express')
const router = express.Router()
const addressController = require('./address.contronller')

router.post('/create', async(req, res) => {
    await addressController.create(req, res)
})

router.get('/get', async(req, res)=>{
    await addressController.get(req, res)
})

router.get('/getAddressByUserId/:userId', async(req, res)=>{
    await addressController.getAddressByUserID(req, res)
})

router.put('/update/:id', async(req, res)=>{
    await addressController.update(req, res)
})

router.patch('/update/is_default/:id', async(req, res)=>{
    await addressController.updateIsDefault(req, res)
})

module.exports = router



// SWAGGERUI

/**
 * @swagger
 * tags:
 *   - name: address
 *     description: API Address
 */

/**
 * @swagger
 * /api/address/create:
 *   post:
 *     summary: Thêm địa chỉ
 *     tags:
 *       - address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/address'
 *     responses:
 *       '200':
 *         description: create success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/address'
 */

/**
 * @swagger
 * /api/address/get:
 *   get:
 *     summary: Lấy danh sách tất cả address
 *     tags: [address]
 *     responses:
 *       200:
 *         description: Danh sách address
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/address'
 */

/**
 * @swagger
 * /api/address/getAddressByUserId/{userId}:
 *   get:
 *     summary: Lấy address theo ID người dùng
 *     tags: [address]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: address tương ứng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/address'
 */

 /**
 * @swagger
 * /api/address/update/{id}:
 *   put:
 *     summary: Cập nhật address theo ID
 *     tags: [address]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/address'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/address'
 */

/**
 * @swagger
 * /api/address/update/is_default/{id}:
 *   patch:
 *     summary: Cập nhật địa chỉ mặc định theo Id
 *     tags:
 *       - address
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Address
 *     requestBody:
 *       required: true
 *       content: 
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/address'
 *     responses:
 *       '200':
 *         description: update success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/address'
 */
