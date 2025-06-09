const Cart = require("./cart.model");
const Product = require("../producttest/product.model");
const mongoose = require("mongoose");

// exports.addItemToCart = async (userId, itemData) => {
//   try {
//     // const dataVariant = item
//     console.log("Service: Bắt đầu addItemToCart cho userId:", userId);
//     console.log("Service: Item cần thêm/cập nhật:", itemData);

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       const error = new Error("UserID không hợp lệ.");
//       error.statusCode = 400;
//       throw error;
//     }
//     if (!itemData || !mongoose.Types.ObjectId.isValid(itemData.id_variant)) {
//       const error = new Error(
//         "id_variant không hợp lệ hoặc itemData bị thiếu."
//       );
//       error.statusCode = 400;
//       throw error;
//     }
//     if (
//       typeof itemData.quantity !== "number" ||
//       itemData.quantity <= 0 ||
//       !Number.isInteger(itemData.quantity)
//     ) {
//       const error = new Error("Số lượng (quantity) không hợp lệ.");
//       error.statusCode = 400;
//       throw error;
//     }

//     const product = await Product.findOne({"variant._id": itemData.id_variant})
//     if (!product) {
//         throw new Error("không thấy sản phẩm có variant này")
//     }
//     // 1. Lấy thông tin chi tiết của variant từ DB để đảm bảo giá và thông tin khác là chính xác
//     const variantDetails = product.variant.id(itemData.id_variant)
//     console.log("variantDetails: ",variantDetails);
//     if (!variantDetails) {
//       const error = new Error(
//         `Không tìm thấy biến thể sản phẩm với ID: ${itemData.id_variant}`
//       );
//       error.statusCode = 404;
//       throw error;
//     }

//     // (Tùy chọn) Kiểm tra tồn kho của variant nếu cần
//     // if (variantDetails.Amount < itemData.quantity) { // Giả sử Variant model có trường Amount là tồn kho
//     //   const error = new Error(`Sản phẩm "${variantDetails.Name_Product || 'Sản phẩm'}" không đủ số lượng tồn kho.`);
//     //   error.statusCode = 400;
//     //   throw error;
//     // }

//     // 2. Tìm giỏ hàng của người dùng, hoặc tạo mới nếu chưa có
//     let cart = await Cart.findOne({ userId: userId });

//     if (!cart) {
//       console.log(
//         "Service: Không tìm thấy giỏ hàng, tạo giỏ hàng mới cho userId:",
//         userId
//       );
//       cart = new Cart({
//         userId: userId,
//         cartItem: [],
//         totalPrice: 0, // Sẽ được tính lại bởi pre-save hook
//       });
//     }

//     // 3. Kiểm tra xem variant này đã có trong giỏ hàng chưa
//     const existingItemIndex = cart.cartItem.findIndex(
//       (ci) =>
//         ci.id_variant &&
//         ci.id_variant.toString() === itemData.id_variant.toString()
//     );

//     if (existingItemIndex > -1) {
//       // Nếu đã có, cộng dồn quantity
//       console.log("Service: Sản phẩm đã có trong giỏ, cập nhật số lượng.");
//       cart.cartItem[existingItemIndex].quantity += itemData.quantity;
//       cart.cartItem[existingItemIndex].status =
//         typeof itemData.status === "boolean"
//           ? itemData.status
//           : cart.cartItem[existingItemIndex].status; // Cập nhật status nếu có
//     } else {
//       // Nếu chưa có, thêm item mới vào mảng cartItem
//       console.log("Service: Sản phẩm chưa có trong giỏ, thêm mới.");
//       cart.cartItem.push({
//         id_variant: variantDetails._id,
//         price: variantDetails.variant_price, // Lấy giá từ Variant model
//         size: variantDetails.variant_size, // Lấy size từ Variant model
//         color: variantDetails.variant_color, // Lấy color từ Variant model
//         // name: variantDetails.Name_Product, // Nếu bạn có trường name trong Variant hoặc Product liên quan
//         // image: variantDetails.ImageUrl, // Nếu có
//         quantity: itemData.quantity,
//         // status: typeof itemData.status === "boolean" ? itemData.status : true, // Mặc định là true khi thêm mới
//       });
//     }

//     // Hook pre('save') trong CartSchema sẽ tự động gọi recalculateTotalPriceBasedOnStatus
//     const savedCart = await cart.save();
//     console.log("Service: Giỏ hàng đã được lưu:", savedCart);
//     return savedCart;
//   } catch (error) {
//     console.error(
//       "Service: Lỗi khi thêm/cập nhật giỏ hàng:",
//       error.message,
//       error.stack
//     );
//     // Ném lỗi để controller có thể bắt và gửi response lỗi phù hợp
//     if (!error.statusCode) {
//       error.statusCode = 500;
//     }
//     throw error;
//   }
// };

// exports.addToCart = async (dataCart) => {
//   try {
//     let totalPrice = 0;
//     const cartItems = dataCart.cartItem;
//     const processCartItems = [];
//     // const price = await Variant.findById(cartItems.id_variant);
//     let cart = await Cart.findOne({ userId: dataCart.userId });

//     for (const item of cartItems) {
//       const dataVariant = await Variant.findById(item.id_variant);
//       console.log(dataVariant.price);
//       if (item.status == true) {
//         totalPrice += dataVariant.price * item.quantity;
//         console.log(item.quantity);
//       }
//       processCartItems.push({
//         id_variant: item.id_variant,
//         price: dataVariant.price,
//         size: dataVariant.size,
//         color: dataVariant.color,
//         quantity: item.quantity,
//         status: item.status,
//       });
//     }
//     console.log(totalPrice);

//     if (!cart) {
//       cart = new Cart({
//         userId: dataCart.userId,
//         cartItem: processCartItems,
//         totalPrice: totalPrice,
//       });
//     }
//     const saveCartItem = await cart.save();
//     console.log(cartItem);
//     return saveCartItem;
//   } catch (error) {
//     console.log(error);
//   }
// };

// exports.deleteCartItem = async (userId, id) => {
//   try {
//     const dataCart = await Cart.findOne({ userId: userId });
//     console.log(dataCart.cartItem);
//     const dataCartItem = await dataCart.cartItem.findByIdAndDelete(id);
//     return dataCartItem;
//   } catch (error) {
//     console.log(error);
//   }
// };
