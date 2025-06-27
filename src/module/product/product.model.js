const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Product = new Schema(
  {
    name_Product: { type: String },
    id_cate: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    image: { type: String },
    // variant_color: { type: String },
    size: { type: String },
    price: { type: Number },
    stock: { type: Number },
    origin: { type: String },
    attribute: { type: String, default: '' },
    // description: { type: String },
    sold: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    status: {type: String, default: true}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("product", Product);
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: "ObjectId của sản phẩm"
 *           example: "60b8d295f1c2ae2b8a7b1a3d"
 *         name_Product:
 *           type: string
 *           description: "Tên của sản phẩm"
 *           example: "Áo thun nam"
 *         id_cate:
 *           type: string
 *           description: "ObjectId của danh mục (tham chiếu Category)"
 *           example: "60b8d295f1c2ae2b8a7b1a3e"
 *         image:
 *           type: string
 *           description: "URL ảnh sản phẩm"
 *           example: "http://example.com/product-image.jpg"
 *         size:
 *           type: string
 *           description: "Kích thước sản phẩm"
 *           example: "XL"
 *         price:
 *           type: number
 *           description: "Giá bán sản phẩm"
 *           example: 150000
 *         stock:
 *           type: integer
 *           description: "Số lượng sản phẩm trong kho"
 *           example: 50
 *         origin:
 *           type: string
 *           description: "Xuất xứ sản phẩm"
 *           example: "Việt Nam"
 *         attribute:
 *           type: string
 *           description: "Thuộc tính bổ sung của sản phẩm"
 *           example: "Chất liệu cotton"
 *           default: ""
 *         sold:
 *           type: integer
 *           description: "Số lượng sản phẩm đã bán"
 *           example: 10
 *           default: 0
 *         rate:
 *           type: number
 *           description: "Điểm đánh giá sản phẩm"
 *           example: 4.5
 *           default: 0
 *         status:
 *           type: string
 *           description: "Trạng thái sản phẩm (true: đang bán, false: ngừng bán)"
 *           example: "true"
 *           default: "true"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: "Thời gian tạo sản phẩm"
 *           example: "2025-06-25T08:21:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: "Thời gian cập nhật sản phẩm"
 *           example: "2025-06-25T10:12:00.000Z"
 */ 