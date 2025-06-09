const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Cart = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    cartItem: [
      {
        id_product: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "product",
        },
        image: { type: String },
        name_product: { type: String },
        price: { type: Number },
        size: { type: String },
        // color: { type: String },
        quantity: { type: Number, default: 1 },
        status: { type: Boolean, default: false },
      },
    ],
    totalPrice: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

Cart.methods.recalculateCartSubtotal = function () {
  let calculatedTotal = 0;
  console.log(
    "Bên trong recalculateTotalPriceBasedOnStatus, cartItem:",
    this.cartItem
  );
  this.cartItem.forEach((item) => {
    if (item.status === true) {
      calculatedTotal += item.price * item.quantity;
    }
  });
  this.totalPrice = calculatedTotal;
  console.log(`Đã tính lại totalPrice (dựa trên status): ${this.totalPrice}`);
  // Thêm logic tính toán các loại phí khác và cartTotal ở đây nếu cần
};

// Middleware để tự động tính lại tổng tiền trước khi lưu
Cart.pre("save", function (next) {
  console.log('Hook pre("save") đang chạy cho Cart ID:', this._id);
  console.log("cartItem isModified:", this.isModified("cartItem"));
  this.recalculateCartSubtotal();
  console.log(
    "totalPrice sau khi recalculate trong pre-save:",
    this.totalPrice
  );
  next();
});

module.exports = mongoose.model("cart", Cart);
