const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Product = new Schema(
  {
    name_Product: { type: String },
    id_cate: { type: Schema.Types.ObjectId, ref: "cate", required: true },
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
