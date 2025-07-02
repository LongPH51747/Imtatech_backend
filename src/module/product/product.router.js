const express = require("express");
const router = express.Router();
const productContronller = require("./product.contronller");
const upload = require("../../../middleware/upload-product.middleware");

router.post("/create", async (req, res) => {
  await productContronller.create(req, res);
});

router.post(
  "/create-product",
  upload.single(
    "image" // Ảnh chính của sản phẩm
  ),
  productContronller.createProduct
);

router.get("/get-all-products", async (req, res) => {
  await productContronller.get(req, res);
});

router.get("/getById/:id", async (req, res) => {
  await productContronller.getById(req, res);
});

router.get("/get-all-products-limit", productContronller.getAllProductsLimit);

router.patch("/updateStatusToTrue/:id", productContronller.updateStatusToTrue);

router.patch(
  "/updateStatusToFalse/:id",
  productContronller.updateStatusToFalse
);

router.delete("/delete/:id", productContronller.delete);

router.get("/search-product", productContronller.searchProduct);

router.put(
  "/update-product-by-id/:id",
  upload.single(
    "image" // Ảnh chính của sản phẩm
  ),
  productContronller.updateProduct
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Quản lý sản phẩm
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
 *                     "name_Product": "Spider plant",
 *                     "price": 120000,
 *                     "size": "Small",
 *                     "stock": 1000,
 *                     "id_cate": "685eab219a14a3dfe8333e6b",
 *                     "origin": "Châu phi",
 *                     "attribute": "Ưa bóng"
 *                   }
 *               image:
 *                 type: file
 *                 format: binary
 *                 description: Ảnh chính của sản phẩm (đại diện)
 *     responses:
 *       201:
 *         description: Tạo sản phẩm thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi hệ thống
 */

/**
 * @swagger
 * /api/products/get-all-products:
 *   get:
 *     summary: Lấy danh sách tất cả sản phẩm
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */

/**
 * @swagger
 * /api/products/get-all-products-limit:
 *   get:
 *     summary: Lấy danh sách sản phẩm có phân trang
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 4
 *         description: Số lượng sản phẩm trên mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm đã phân trang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   description: Danh sách sản phẩm có trường ảnh hiển thị
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: integer
 *                   description: Tổng số sản phẩm
 *                 page:
 *                   type: integer
 *                   description: Trang hiện tại
 *                 totalPages:
 *                   type: integer
 *                   description: Tổng số trang dựa trên limit
 *       500:
 *         description: Lỗi máy chủ
 */

/**
 * @swagger
 * /api/products/getById/{id}:
 *   get:
 *     summary: Lấy thông tin sản phẩm theo ID ( bao gồm variant đã encode ảnh base 64 )
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Sản phẩm được tìm thấy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Không tìm thấy sản phẩm
 */

/**
 * @swagger
 * /api/products/delete/{id}:
 *   delete:
 *     summary: Xóa sản phẩm theo ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sản phẩm cần xóa
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 */

/**
 * @swagger
 * /api/products/update-product-by-id/{id}:
 *   put:
 *     summary: Cập nhật thông tin sản phẩm (ảnh chính, mô tả, danh mục, v.v.)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name_Product:
 *                 type: string
 *                 description: "Tên của sản phẩm"
 *                 example: "Áo thun nam"
 *               id_cate:
 *                 type: string
 *                 description: "ObjectId của danh mục (tham chiếu Category)"
 *                 example: "60b8d295f1c2ae2b8a7b1a3e"
 *               size:
 *                 type: string
 *                 description: "Kích thước sản phẩm"
 *                 example: "small"
 *               price:
 *                 type: number
 *                 description: "Giá bán sản phẩm"
 *                 example: 150000
 *               stock:
 *                 type: integer
 *                 description: "Số lượng sản phẩm trong kho"
 *                 example: 50
 *               origin:
 *                 type: string
 *                 description: "Xuất xứ sản phẩm"
 *                 example: "Việt Nam"
 *               attribute:
 *                 type: string
 *                 description: "Thuộc tính bổ sung của sản phẩm"
 *                 example: "Ưa sáng"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh đại diện mới của sản phẩm (nếu có)
 *     responses:
 *       200:
 *         description: Sản phẩm đã được cập nhật thành công
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/products/updateStatusToTrue/{id}:
 *   patch:
 *     summary: Cập nhật trạng thái sản phẩm (còn hàng)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sản phẩm
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 */

/**
 * @swagger
 * /api/products/updateStatusToFalse/{id}:
 *   patch:
 *     summary: Cập nhật trạng thái sản phẩm (hết hàng)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sản phẩm
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 */

/**
 * @swagger
 * /api/products/search-product:
 *   get:
 *     summary: Tìm kiếm sản phẩm theo tên hoặc màu sắc biến thể
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm (tên hoặc màu)
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: ID danh mục để lọc thêm (tùy chọn)
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
