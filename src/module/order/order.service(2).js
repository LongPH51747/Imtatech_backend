// const Order = require("./order.model"); // Model Order của bạn
// const Product = require("../producttest/product.model"); // Model Product của bạn (với variant nhúng)
// const Cart = require("../cart/cart.model");
// const mongoose = require("mongoose");
// Giả định các model đã được import ở trên

// Hàm tiện ích để tạo lỗi
// function createError(status, message) {
//   const err = new Error(message);
//   err.statusCode = status;
//   return err;
// }

// exports.createNow = async(orderData) => {
//   try {
//     let total_amount = 0
//     let total_price = 0
//     const orderDetail = orderData.orderDetail
//     const id_variant = orderData.id_variant
//     const product = await Product.findOne({"variant._id": id_variant})
//     const variant = product.variant.id(id_variant)
//     const processedOrderDetail = []
//     processedOrderDetail.push({
//       id_variant: id_variant,
//       quantity: orderDetail.quantity
//     })
//   } catch (error) {
//     console.log(error);
//     if(!error.statusCode) {
//       error.statusCode = 500
//     }
//     throw error
//   }
// }

// services/orderService.js
const mongoose = require('mongoose');
const Order = require('./order.model');       // Model Order
const Product = require('../prodtest/prod.model');     // Model "prod"
const Variant = require('../detailtest/detail.model');     // Model "detail"
const Cart = require('../cart/cart.model');         // Model "cart"

// Hàm tiện ích để tạo lỗi
function createError(status, message) {
  const err = new Error(message);
  err.statusCode = status;
  return err;
}

// Giả định orderData từ client có dạng:
// {
//   orderItems: [
//     { id_variant: "ID_CUA_VARIANT_CU_THE", quantity: X },
//     ...
//   ],
//   id_cart: "..." (tùy chọn, nếu mua từ giỏ hàng),
//   id_address: "...",
//   shipping: Y,
//   payment_method: "..."
// }
exports.createOrder = async (orderData, userId) => {
  console.log("Service: Bắt đầu tạo đơn hàng cho userId:", userId);
  const { orderItems, id_cart, id_address, shipping, payment_method } = orderData;

  // ----- VALIDATION ĐẦU VÀO -----
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw createError(400, 'UserID không hợp lệ.');
  }
  if (!id_address || !mongoose.Types.ObjectId.isValid(id_address)) {
    throw createError(400, 'ID địa chỉ không hợp lệ.');
  }
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    throw createError(400, 'Danh sách sản phẩm đặt hàng (orderItems) không được để trống.');
  }
  if (!payment_method) {
    throw createError(400, 'Phương thức thanh toán là bắt buộc.');
  }
  // ----- KẾT THÚC VALIDATION -----

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let subTotalAmountForOrder = 0;
    const processedOrderItemsForSchema = [];

    // Tạo Map để theo dõi và cập nhật tồn kho của các variant
    const variantsToUpdateStock = new Map();

    for (const item of orderItems) {
      if (!item.id_variant || !mongoose.Types.ObjectId.isValid(item.id_variant)) {
        throw createError(400, `ID biến thể không hợp lệ cho item: ${JSON.stringify(item)}`);
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        throw createError(400, `Số lượng không hợp lệ cho biến thể ID: ${item.id_variant}`);
      }

      // 1. Tìm thông tin Variant và populate thông tin Product cha của nó
      const variantDoc = await Variant.findById(item.id_variant).populate('id_product').session(session);

      if (!variantDoc) {
        throw createError(404, `Không tìm thấy biến thể sản phẩm với ID: ${item.id_variant}`);
      }
      if (!variantDoc.id_product) {
        throw createError(404, `Không tìm thấy sản phẩm gốc cho biến thể này.`);
      }

      // 2. Kiểm tra tồn kho của variant
      if (variantDoc.variant_stock < item.quantity) {
        throw createError(400, `Sản phẩm "${variantDoc.id_product.product_name} - ${variantDoc.variant_color} - ${variantDoc.variant_size}" không đủ số lượng tồn kho (Còn: ${variantDoc.variant_stock}, Đặt: ${item.quantity}).`);
      }

      // 3. Tính toán giá cho item này
      const itemTotalPrice = variantDoc.variant_price * item.quantity;

      processedOrderItemsForSchema.push({
        id_variant: variantDoc._id,
        name_product: variantDoc.id_product.product_name,
        color: variantDoc.variant_color,
        size: variantDoc.variant_size,
        quantity: item.quantity,
        unit_price_item: variantDoc.variant_price,
        total_price_item: itemTotalPrice,
        image: variantDoc.variant_image,
      });

      subTotalAmountForOrder += itemTotalPrice;

      // 4. Cập nhật tồn kho trong Map
      // Lấy lại variant từ map nếu đã có, hoặc lấy từ DB nếu chưa
      let variantToUpdate = variantsToUpdateStock.get(variantDoc._id.toString());
      if (!variantToUpdate) {
        variantToUpdate = variantDoc;
        variantsToUpdateStock.set(variantDoc._id.toString(), variantToUpdate);
      }
      variantToUpdate.variant_stock -= item.quantity;
    }

    // 5. Lưu lại tất cả các Variant đã bị thay đổi tồn kho
    for (const variantDocToSave of variantsToUpdateStock.values()) {
      await variantDocToSave.save({ session });
    }

    // 6. Tính toán tổng tiền cuối cùng
    const actualShipping = (shipping !== undefined && typeof shipping === 'number' && shipping >= 0)
      ? shipping
      : Order.schema.path('shipping').defaultValue; // Lấy default từ OrderSchema

    const finalTotalAmount = subTotalAmountForOrder + actualShipping;

    // 7. Tạo đơn hàng mới
    const newOrderData = {
      userId: userId,
      orderItems: processedOrderItemsForSchema,
      id_address: id_address,
      payment_method: payment_method,
      sub_total_amount: subTotalAmountForOrder,
      total_amount: finalTotalAmount,
      status: "Chờ xác nhận",
    };
    if (shipping !== undefined) {
      newOrderData.shipping = shipping;
    }

    const newOrder = new Order(newOrderData);
    const savedOrder = await newOrder.save({ session });

    // 8. (TÙY CHỌN) Nếu mua từ giỏ hàng (có id_cart), xóa các item đã đặt khỏi giỏ hàng
    if (id_cart && mongoose.Types.ObjectId.isValid(id_cart)) {
      const userCart = await Cart.findById(id_cart).session(session);
      if (userCart && userCart.userId.toString() === userId.toString()) {
        const orderedVariantIds = orderItems.map(item => item.id_variant.toString());
        userCart.cartItem = userCart.cartItem.filter(
          cartItem => !orderedVariantIds.includes(cartItem.id_variant.toString())
        );
        await userCart.save({ session }); // Hook pre('save') của Cart sẽ tính lại totalPrice của Cart
        console.log("Service: Đã cập nhật/xóa các item đã đặt khỏi giỏ hàng ID:", id_cart);
      }
    }

    await session.commitTransaction();
    console.log("Service: Đơn hàng đã được tạo thành công:", savedOrder._id);
    return savedOrder;

  } catch (error) {
    await session.abortTransaction();
    console.error("Service: Lỗi trong quá trình tạo đơn hàng:", error.message, error.stack);
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = 'Lỗi máy chủ khi tạo đơn hàng.';
    }
    throw error;
  } finally {
    session.endSession();
  }
};