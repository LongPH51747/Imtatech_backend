ae code các model tại pakage này
vd: 

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Product = new Schema(
  {
    name_Product: { type: String },
    // variant: [
    //   {
    //     color: { type: String },
    //     size: { type: String },
    //     price: { type: Number },
    //     amount: { type: Number },
    //   },
    // ],
    description: { type: String },
    sold: { type: Number },
    rate: { type: Number },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("product", Product);
