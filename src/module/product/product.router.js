const express = require("express");
const router = express.Router();
const productContronller = require("./product.contronller");
const upload = require('../../../middleware/upload-product.middleware')

router.post("/create", async (req, res) => {
  await productContronller.create(req, res);
});

router.post('/create-product', upload.fields([
    {
        name: 'product_image', // Ảnh chính của sản phẩm
        maxCount: 1 // Chỉ cho phép 1 ảnh chính
    },
]),productContronller.createProduct)

router.get("/get", async (req, res) => {
  await productContronller.get(req, res);
});

router.get("/getById/:id", async (req, res) => {
  await productContronller.getById(req, res);
});

router.get('/get-all-products-limit', productContronller.getAllProductsLimit)

router.put('/updateProdById/:id', productContronller.update)

router.patch('/updateStatusToTrue/:id', productContronller.updateStatusToTrue)

router.patch('/updateStatusToFalse/:id', productContronller.updateStatusToFalse)

router.delete('/delete/:id', productContronller.delete)

router.get('/search-product', productContronller.searchProduct)

module.exports = router;


/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Quản lý sản phẩm và biến thể sản phẩm
 */

/**
 * @swagger
 * /api/products/create-product:
 *   post:
 *     summary: Tạo sản phẩm mới với các biến thể
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: Dữ liệu sản phẩm dạng JSON
 *                 example: >
 *                   {
 *                     "product_name": "Áo thun thể thao",
 *                     "product_price": 120000,
 *                     "product_description": "Áo thun co giãn, thoáng mát, phù hợp tập gym.",
 *                     "product_status": true,
 *                     "product_category": "684178da78a1c4d774bd5784",
 *                   }
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh chính của sản phẩm (đại diện)
 *     responses:
 *       201:
 *         description: Tạo sản phẩm thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/product'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi hệ thống
 */
