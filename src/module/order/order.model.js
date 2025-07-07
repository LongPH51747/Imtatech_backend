const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    orderItems: [
      {
        //=> lấy product theo id_variant
        // và lấy id_variant theo id_cart
        // ( nếu mua nhiều variant )
        id_product: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'product'
        },
        name_product: { type: String },
        size: { type: String },
        quantity: { type: Number },
        unit_price_item: { type: Number },
        total_price_item: { type: Number },
        image: { type: String },
        cate_name: {type: Schema.Types.ObjectId, ref: "Category"}
      },
    ],
    id_address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    shipping: { type: Number, default: 20000 },
    status: { type: String, default: "Chờ xác nhận" },
    sub_total_amount: { type: Number },
    total_amount: { type: Number },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("order", OrderSchema);


/**
 * @swagger
 * components:
 *   schemas:
 *     order:
 *       type: object
 *       required:
 *         - id_address
 *         - id_product
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *           format: ObjectId
 *         orderItems:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_product:
 *                 type: string
 *               name_product: 
 *                 type: String
 *               size:
 *                 type: String
 *               quantity:
 *                 type: Number
 *               unit_price_item:
 *                 type: Number
 *               total_price_item:
 *                 type: Number
 *               image:
 *                 type: String
 *         shipping: 
 *           type: string
 *         status:
 *           type: String
 *           default: "Chờ xác nhận"
 *         sub_total_amount:
 *           type: Number
 *         total_amount:
 *           type: Number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */