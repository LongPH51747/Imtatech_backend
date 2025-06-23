const Order = require("./order.model");
const Product = require("../product/product.model");
const Cart = require("../cart/cart.model");
const mongoose = require("mongoose");

// đây là hàm để bắt lỗi error
function createError(status, message) {
  const err = new Error(message);
  err.statusCode = status;
  return err;
}

exports.create = async (orderData, userId) => {
  console.log("Service: Bắt đầu tạo đơn hàng cho userId:", userId);
  console.log(
    "Service: Dữ liệu nhận được (orderData):",
    JSON.stringify(orderData, null, 2)
  );

  // Giả sử orderData từ req.body có dạng:
  // {
  //   orderItems: [
  //     { productId: "ID_CUA_PRODUCT_CHA", id_variant: "ID_CUA_VARIANT_CON", quantity: X },
  //     ...
  //   ],
  //   id_cart: "..." (tùy chọn),
  //   id_address: "...",
  //   payment_method: "..."
  // }
  const { orderItems, id_cart, id_address, shipping, payment_method } = orderData;

  // ----- VALIDATION ĐẦU VÀO -----
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw createError(400, "UserID không hợp lệ.");
  }
  if (!id_address || !mongoose.Types.ObjectId.isValid(id_address)) {
    throw createError(400, "ID địa chỉ không hợp lệ.");
  }
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    throw createError(
      400,
      "Danh sách sản phẩm đặt hàng (orderItems) không được để trống."
    );
  }
  if (!payment_method) {
    throw createError(400, "Phương thức thanh toán là bắt buộc.");
  }
  const VALID_PAYMENT_METHODS = ['COD', 'BANKING', 'MOMO']; // thêm các phương thức khác nếu có
  if (!payment_method || !VALID_PAYMENT_METHODS.includes(payment_method)) {
    throw createError(400, "Phương thức thanh toán không hợp lệ.");
  }
  // ----- KẾT THÚC VALIDATION -----

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let subTotalAmountForOrder = 0;
    const processedOrderItemsForSchema = [];
    const productsToUpdateStock = new Map(); // Dùng Map để lưu trữ các instance Product cần cập nhật

    for (const item of orderItems) {
      if (
        !item.id_product ||
        !mongoose.Types.ObjectId.isValid(item.id_product)
      ) {
        throw createError(
          400,
          `ID sản phẩm cha (productId) không hợp lệ cho item: ${JSON.stringify(
            item
          )}`
        );
      }
      if (
        !item.id_variant ||
        !mongoose.Types.ObjectId.isValid(item.id_variant)
      ) {
        throw createError(
          400,
          `ID biến thể (id_variant) không hợp lệ cho item: ${JSON.stringify(
            item
          )}`
        );
      }
      if (
        typeof item.quantity !== "number" ||
        item.quantity <= 0 ||
        !Number.isInteger(item.quantity)
      ) {
        throw createError(
          400,
          `Số lượng không hợp lệ cho biến thể ID: ${item.id_variant}`
        );
      }

      // 1. Tìm Product cha (hoặc lấy từ Map nếu đã tìm trước đó)
      let productDoc;
      if (productsToUpdateStock.has(item.id_product.toString())) {
        productDoc = productsToUpdateStock.get(item.id_product.toString());
      } else {
        productDoc = await Product.findById(item.id_product).session(session);
        if (!productDoc) {
          throw createError(
            404,
            `Không tìm thấy sản phẩm với ID: ${item.id_product}`
          );
        }
        if (!productDoc.product_status) {
          throw createError(400, `Sản phẩm "${productDoc.product_name}" hiện không còn kinh doanh.`);
        }
        productsToUpdateStock.set(item.id_product.toString(), productDoc); // Lưu instance để tái sử dụng và cập nhật
      }

      // 2. Tìm variant con bên trong Product bằng _id của variant
      const variantInProduct = productDoc.variant.id(item.id_variant);
      if (!variantInProduct) {
        throw createError(
          404,
          `Không tìm thấy biến thể với ID: ${item.id_variant} trong sản phẩm "${productDoc.name_Product}"`
        );
      }

      // 3. Kiểm tra tồn kho
      if (variantInProduct.variant_stock < item.quantity) {
        throw createError(
          400,
          `Sản phẩm "${productDoc.name_Product} - ${variantInProduct.variant_color} - ${variantInProduct.variant_size}" không đủ số lượng tồn kho (Còn: ${variantInProduct.variant_stock}, Đặt: ${item.quantity}).`
        );
      }

      // 4. Tính toán giá cho item này
      const itemTotalPrice = variantInProduct.variant_price * item.quantity;

      processedOrderItemsForSchema.push({
        id_variant: variantInProduct._id,
        name_product: productDoc.name_Product,
        color: variantInProduct.variant_color, // Lấy từ schema Product của bạn
        size: variantInProduct.variant_size, // Lấy từ schema Product của bạn
        quantity: item.quantity,
        unit_price: variantInProduct.variant_price,
        total_price_item: itemTotalPrice,
        image: variantInProduct.variant_image,
      });

      subTotalAmountForOrder += itemTotalPrice;

      // 5. Trừ tồn kho trực tiếp trên sub-document variant CỦA INSTANCE productDoc
      variantInProduct.variant_stock -= item.quantity;
      console.log(
        `Đã trừ stock cho variant ${variantInProduct._id}, stock mới: ${variantInProduct.variant_stock}`
      );
      // Đánh dấu mảng variants là đã bị sửa đổi trên productDoc này
      productDoc.markModified("variant");
    }

    // 6. Lưu tất cả các Product đã bị thay đổi tồn kho
    for (const productDocToSave of productsToUpdateStock.values()) {
      console.log(
        `Chuẩn bị lưu Product ID: ${productDocToSave._id} với variants:`,
        JSON.stringify(productDocToSave.variants, null, 2)
      );
      await productDocToSave.save({ session });
      console.log(`Đã lưu Product ID: ${productDocToSave._id}`);
    }

    // 7. Tính toán tổng tiền cuối cùng
    let actualShipping;
    if (shipping !== undefined) {
      if (typeof shipping !== 'number' || shipping < 0) {
        throw createError(400, "Phí vận chuyển không hợp lệ");
      }
      actualShipping = shipping;
    } else {
      actualShipping = Order.schema.path('shipping').defaultValue;
    }

    const finalTotalAmount = subTotalAmountForOrder + actualShipping;

    // 8. Tạo đơn hàng mới
    const newOrderData = {
      userId: userId,
      orderItems: processedOrderItemsForSchema,
      id_address: id_address,
    //   shipping: shipping || 0, // Giữ tên 'shipping' nếu OrderSchema của bạn là vậy
      payment_method: payment_method || "COD",
      sub_total_amount: subTotalAmountForOrder,
      total_amount: finalTotalAmount,
    };

    if (shipping !== undefined) {
        newOrderData.shipping = shipping
    }

    const newOrder = new Order(newOrderData)
    const savedOrder = await newOrder.save({ session });

    // 9. (TÙY CHỌN) Xóa item khỏi giỏ hàng
    if (id_cart && mongoose.Types.ObjectId.isValid(id_cart)) {
      const userCart = await Cart.findById(id_cart).session(session);
      if (!userCart) {
        throw createError(404, "Không tìm thấy giỏ hàng");
      }
      if (userCart.userId.toString() !== userId.toString()) {
        throw createError(403, "Bạn không có quyền truy cập giỏ hàng này");
      }
      const orderedVariantIdsInOrder = orderItems.map((item) =>
        item.id_variant.toString()
      );
      userCart.cartItem = userCart.cartItem.filter(
        (cartItemInCart) =>
          !orderedVariantIdsInOrder.includes(
            cartItemInCart.id_variant.toString()
          )
      );
      await userCart.save({ session }); // Hook pre-save của Cart sẽ tính lại totalPrice của Cart
      console.log(
        "Service: Đã cập nhật/xóa các item đã đặt khỏi giỏ hàng ID:",
        id_cart
      );
    }

    await session.commitTransaction();
    console.log("Service: Đơn hàng đã được tạo thành công:", savedOrder._id);
    return savedOrder;
  } catch (error) {
    await session.abortTransaction();
    console.error(
      "Service: Lỗi trong quá trình tạo đơn hàng (variant nhúng):",
      error.message,
      error.stack
    );
    // ... (throw error như cũ) ...
    if (!error.statusCode) {
      const newError = new Error(
        error.message || "Lỗi máy chủ khi tạo đơn hàng."
      );
      newError.statusCode = 500;
      throw newError;
    }
    throw error;
  } finally {
    session.endSession();
  }
};

// exports.create = async (orderData) => {
//   try {
//     console.log("service");
//     let total_amount = 0;
//     let total_price = 0;
//     const orderItem = orderData.orderItem;
//     const processedOrderDetail = [];

//     console.log(processedOrderDetail);
//     console.log(orderItem);
//     const id_Cart = orderItem.id_Cart;
//     if (id_Cart) {
    
//     }

//     for (const item of orderItem) {
//       const id_variant = item.id_variant;
//       const product = await Product.findOne({ "variant._id": id_variant });
//       const variant = product.variant.id(id_variant)
//       total_price += item.unit_price * item.quantity;
//       total_amount += total_price;
//       processedOrderDetail.push({
//         id_variant: item.id_variant,
//         name: product.name_Product,
//         color: variant.variant_color,
//         size: variant.variant_size,
//         quantity: item.quantity,
//         unit_price_item: variant.variant_price,
//         total_price: total_price,
//       });
//     }

//     const newOrder = new Order({
//       userId: orderData.userId,
//       orderDetail: processedOrderDetail,
//       id_address: orderData.id_address,
//       sub_total_amount: total_amount,
//       total_amount: total_amount + orderData.ship,
//     });

//     const saveOrder = await newOrder.save();
//     console.log(saveOrder);

//     return saveOrder;
//   } catch (error) {
//     console.log(error);
//   }
// };

exports.updateStatus = async (orderStatus, id, res) => {
  try {
    const data = await Order.findById(id);
    if (!data) {
      return res.status(404).json({ message: "Order not found in services" });
    }

    data.status = orderStatus;
    await data.save;

    return data;
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to update order status in services",
      error: error,
    });
  }
};

exports.get = async () => {
  try {
    const data = await Order.find();
    return data;
  } catch (error) {
    console.log(error);
  }
};

// Lấy danh sách đơn hàng của user
exports.getOrdersByUser = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw createError(400, "UserID không hợp lệ");
    }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('id_address');
    
    return orders;
  } catch (error) {
    console.error("Service: Lỗi khi lấy danh sách đơn hàng:", error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
};

// Lấy chi tiết một đơn hàng
exports.getOrderById = async (orderId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw createError(400, "ID đơn hàng không hợp lệ");
    }

    const order = await Order.findById(orderId).populate('id_address');
    
    if (!order) {
      throw createError(404, "Không tìm thấy đơn hàng");
    }

    return order;
  } catch (error) {
    console.error("Service: Lỗi khi lấy chi tiết đơn hàng:", error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
};

// // Cập nhật trạng thái đơn hàng
// exports.updateOrderStatus = async (orderId, newStatus, userId) => {
//   try {
    
//     if (!mongoose.Types.ObjectId.isValid(orderId)) {
//       throw createError(400, "ID đơn hàng không hợp lệ");
//     }

//     const order = await Order.findById(orderId);
//     if (!order) {
//       throw createError(404, "Không tìm thấy đơn hàng");
//     }

//     if (order.userId.toString() !== userId.toString()) {
//       throw createError(403, "Bạn không có quyền cập nhật đơn hàng này");
//     }

//     // Nếu đơn hàng đã hoàn thành hoặc đã hủy thì không cho cập nhật
//     if (order.status === 'delivered' || order.status === 'cancelled') {
//       throw createError(400, "Không thể cập nhật trạng thái của đơn hàng đã hoàn thành hoặc đã hủy");
//     }

//     order.status = newStatus;
//     const updatedOrder = await order.save();
//     return updatedOrder;
//   } catch (error) {
//     console.error("Service: Lỗi khi cập nhật trạng thái đơn hàng:", error);
//     if (!error.statusCode) {
//       error.statusCode = 500;
//     }
//     throw error;
//   }
// };

// Hủy đơn hàng

exports.cancelOrder = async (orderId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw createError(400, "ID đơn hàng không hợp lệ");
    }

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      throw createError(404, "Không tìm thấy đơn hàng");
    }

    if (order.userId.toString() !== userId.toString()) {
      throw createError(403, "Bạn không có quyền hủy đơn hàng này");
    }

    if (order.status === 'delivered') {
      throw createError(400, "Không thể hủy đơn hàng đã giao thành công");
    }

    if (order.status === 'cancelled') {
      throw createError(400, "Đơn hàng đã được hủy trước đó");
    }

    // Hoàn lại số lượng tồn kho
    for (const item of order.orderItems) {
      const product = await Product.findOne({
        'variant._id': item.id_variant
      }).session(session);

      if (product) {
        const variant = product.variant.id(item.id_variant);
        if (variant) {
          variant.variant_stock += item.quantity;
          product.markModified('variant');
          await product.save({ session });
        }
      }
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    const cancelledOrder = await order.save({ session });

    await session.commitTransaction();
    return cancelledOrder;

  } catch (error) {
    await session.abortTransaction();
    console.error("Service: Lỗi khi hủy đơn hàng:", error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  } finally {
    session.endSession();
  }
};

// export const update = () => {}
