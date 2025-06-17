const express = require('express')
const router = express.Router()
const addressController = require('./address.contronller')

router.post('/create/userId/:id', async(req, res) => {
    await addressController.create(req, res)
})

router.get('/get', async(req, res)=>{
    await addressController.get(req, res)
})

router.get('/getAddressByUserId/:id', async(req, res)=>{
    await addressController.getAddressByUserID(req, res)
})

router.put('/update/:id', async(req, res)=>{
    await addressController.update(req, res)
})

router.patch('/update/is_default/:id', async(req, res)=>{
    await addressController.updateIsDefault(req, res)
})

router.get('/getById/:id', addressController.getById)

router.delete('/deleteAddress/:id', addressController.deleteAddress)

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
 * /api/address/create/userId/{id}:
 *   post:
 *     summary: Thêm địa chỉ
 *     tags:
 *       - address
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
 *             properties: 
 *               fullName: 
 *                 type: string
 *                 default: ""
 *               addressDetail: 
 *                 type: string
 *               phone_number: 
 *                 type: string
 *               is_default:
 *                 type: boolean
 *                 default: false
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
 * /api/address/getAddressByUserId/{id}:
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

/**
 * @swagger
 * /api/address/getById/{id}:
 *   get:
 *     summary: Lấy address theo ID
 *     tags: [address]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Address
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
 * /api/address/deleteAddress/{id}:
 *   delete:
 *     summary: Xóa address theo ID
 *     tags: [address]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Address
 *     responses:
 *       200:
 *         description: address tương ứng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/address'
 */
