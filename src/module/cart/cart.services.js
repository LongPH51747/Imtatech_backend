const Cart = require("./cart.model");
// const Variant = require("../varianttest/variant.model");
const Product = require('../product/product.model')
const mongoose = require('mongoose')

exports.addItemToCart = async (userId, itemData) => {
  try {
    console.log("Service: Bắt đầu addItemToCart cho userId:", userId); // Service: Starting addItemToCart for userId:
    console.log("Service: Item cần thêm/cập nhật:", itemData); // Service: Item to add/update:

    // --- Kiểm tra đầu vào ---
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error('UserID không hợp lệ.');
      error.statusCode = 400;
      throw error;
    }

    if (!itemData || !itemData.id_product || !itemData.id_variant) {
        const error = new Error('itemData không đầy đủ. Yêu cầu id_product và id_variant.');
        error.statusCode = 400;
        throw error;
    }
    if (!mongoose.Types.ObjectId.isValid(itemData.id_product)) {
      const error = new Error('id_product không hợp lệ.');
      error.statusCode = 400;
      throw error;
    }
    if (!mongoose.Types.ObjectId.isValid(itemData.id_variant)) {
      const error = new Error('id_variant không hợp lệ.');
      error.statusCode = 400;
      throw error;
    }
    if (typeof itemData.quantity !== 'number' || itemData.quantity <= 0 || !Number.isInteger(itemData.quantity)) {
      const error = new Error('Số lượng (quantity) không hợp lệ.');
      error.statusCode = 400;
      throw error;
    }

    // 1. Lấy thông tin chi tiết của product và variant từ DB
    const product = await Product.findById(itemData.id_product);
    if (!product) {
      const error = new Error(`Không tìm thấy sản phẩm với ID: ${itemData.id_product}`);
      error.statusCode = 404;
      throw error;
    }
    if (product.stock < itemData.quantity) {
      const error = new Error(`Sản phẩm "${product.name_Product} - ${variantDetails.variant_size || ''} ${variantDetails.variant_color || ''}" không đủ số lượng tồn kho. Chỉ còn ${variantDetails.variant_stock}.`);
      error.statusCode = 400;
      throw error;
    }

    // 2. Tìm giỏ hàng của người dùng, hoặc tạo mới nếu chưa có
    let cart = await Cart.findOne({ userId: userId });

    if (!cart) {
      console.log("Service: Không tìm thấy giỏ hàng, tạo giỏ hàng mới cho userId:", userId); // Service: Cart not found, creating new cart for userId:
      cart = new Cart({
        userId: userId,
        cartItem: [],
        totalPrice: 0, // Sẽ được tính lại bởi pre-save hook
      });
    }

    // 3. Kiểm tra xem variant này đã có trong giỏ hàng chưa (sử dụng id_variant)
    const existingItemIndex = cart.cartItem.findIndex(
      (ci) => ci.id_product && ci.id_product.toString() === itemData.id_product.toString()
    );

    if (existingItemIndex > -1) {
      // Nếu đã có, cộng dồn quantity
      console.log("Service: Biến thể sản phẩm đã có trong giỏ, cập nhật số lượng."); // Service: Product variant already in cart, updating quantity.
      const existingItem = cart.cartItem[existingItemIndex];
      const newQuantity = existingItem.quantity + itemData.quantity;

      // (Tùy chọn) Kiểm tra lại tồn kho khi cộng dồn
      if (product.stock < newQuantity) {
        const error = new Error(`Không thể thêm ${itemData.quantity} sản phẩm "${product.name_Product} - ${product.size || ''}". Số lượng trong giỏ (${existingItem.quantity}) cộng với số lượng yêu cầu (${itemData.quantity}) vượt quá tồn kho (${product.stock}).`);
        error.statusCode = 400;
        throw error;
      }
      existingItem.quantity = newQuantity;

      // Cập nhật status nếu được cung cấp trong itemData, ngược lại giữ nguyên status cũ
      if (typeof itemData.status === 'boolean') {
        existingItem.status = itemData.status;
      }
      // Nếu bạn muốn luôn đặt status thành true khi cập nhật (ví dụ: kích hoạt nó), bạn có thể làm:
      // existingItem.status = true;

    } else {
      // Nếu chưa có, thêm item mới vào mảng cartItem
      console.log("Service: Biến thể sản phẩm chưa có trong giỏ, thêm mới."); // Service: Product variant not in cart, adding new.
      cart.cartItem.push({
        id_product: product._id, // ObjectId từ product đã fetch
        name_product: product.name_Product, // Khớp với trường 'name_product' trong schema
        price: product.price,
        size: product.size,
        image: product.image || '', // Lấy ảnh từ product, fallback về chuỗi rỗng
        quantity: itemData.quantity,
        status: typeof itemData.status === 'boolean' ? itemData.status : true, // Mặc định là true (đã chọn) cho item mới
      });
    }

    // Hook pre('save') trong CartSchema sẽ tự động gọi recalculateCartSubtotal
    const savedCart = await cart.save();
    console.log("Service: Giỏ hàng đã được lưu:", savedCart._id); // Service: Cart has been saved:
    return savedCart;

  } catch (error) {
    console.error("Service: Lỗi khi thêm/cập nhật giỏ hàng:", error.message); // Service: Error when adding/updating cart:
    if (error.stack && !error.statusCode) { // Ghi log stack cho các lỗi không mong muốn
        console.error(error.stack);
    }
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
};

exports.updateStatusToFalse = async (id_cartItem) => {
  try {
    const cart = await Cart.findOne({"cartItem._id":id_cartItem})
    const cartItem = cart.cartItem.id(id_cartItem)
    cartItem.status = false
    const statusFalse = await cartItem.save()
    await cart.save()
    return statusFalse
  } catch (error) {
    console.log("Service failed: Update status to false",error);
    if (!error.statusCode) {
      error.statusCode = 500
    }
    throw error
  }
}

exports.updateStatusToTrue = async (id_cartItem) => {
  try {
    const cart = await Cart.findOne({"cartItem._id":id_cartItem})
    const cartItem = cart.cartItem.id(id_cartItem)
    cartItem.status = true
    const statusTrue = await cartItem.save()
    await cart.save()
    return statusTrue
  } catch (error) {
    console.log("Service failed: Update status to false",error);
    if (!error.statusCode) {
      error.statusCode = 500
    }
    throw error
  }
}

exports.removeCartItem = async (userId, cartItemIdToRemove, res) => {
  console.log("đã chạy vô removeCartItem");

  // if (!mongoose.Types.ObjectId.isValid(cartItemIdToRemove)) {
  //   return res.status(400).json({ message: 'ID của mục trong giỏ hàng không hợp lệ.' });
  // }

  try {
    const cart = await Cart.findOne({ userId: userId });
    console.log(cart);

    if (!cart) {
      return 0;
    }

    // Tìm vị trí của item trong mảng cartItem
    const itemIndex = cart.cartItem.findIndex(
      (item) => item._id.toString() === cartItemIdToRemove
    );

    if (itemIndex === -1) {
      return 1;
    }

    // Xóa item khỏi mảng
    cart.cartItem.splice(itemIndex, 1);

    // Tính toán lại tổng tiền (schema pre-save hook cũng sẽ làm điều này,
    // nhưng gọi ở đây để có totalPrice cập nhật ngay trước khi trả về response nếu cần)
    // cart.recalculateTotalPrice(); // Không cần gọi ở đây nếu pre-save hook đã xử lý
    console.log(cart);
    cart.markModified("cartItem");
    const updatedCart = await cart.save(); // Lưu thay đổi, pre-save hook sẽ tính lại totalPrice
    console.log(updatedCart);

    return updatedCart;
  } catch (error) {
    console.error("Lỗi khi xóa mục khỏi giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi xóa mục khỏi giỏ hàng." });
  }
};

exports.updateCartItemQuantity = async (newQuantity, cartItemId, userId) => {
  // const userId = req.user._id;
  // const { cartItemId, newQuantity } = cartItemData;

  // ----- VALIDATION ĐẦU VÀO -----
  if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
    return res.status(400).json({ message: 'ID của mục trong giỏ hàng không hợp lệ.' });
  }
  if (typeof newQuantity !== 'number' || !Number.isInteger(newQuantity)) {
    return res.status(400).json({ message: 'Số lượng mới không hợp lệ.' });
  }
  // ----- KẾT THÚC VALIDATION -----

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ userId }).session(session);

    if (!cart) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng cho người dùng này.' });
    }

    // Tìm cartItem cụ thể bằng _id của nó trong mảng cart.cartItem
    const cartItemToUpdate = cart.cartItem.id(cartItemId);

    if (!cartItemToUpdate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy mục sản phẩm này trong giỏ hàng.' });
    }

    if (newQuantity <= 0) {
      // Nếu số lượng mới <= 0 hiện log
      console.log(`Service: Số lượng không thể nhỏ hơn hoặc bằng 0.`);
    } else {
      // Nếu số lượng mới > 0, cập nhật quantity
      // 1. Tìm Product cha để lấy thông tin variant và kiểm tra tồn kho
      // Vì cartItem.id_product là String và ref tới "producttest",
      // chúng ta cần đảm bảo nó là ObjectId nếu Product model dùng ObjectId
      let productIdToFind = cartItemToUpdate.id_product;
      if (typeof productIdToFind === 'string' && mongoose.Types.ObjectId.isValid(productIdToFind)) {
          productIdToFind = new mongoose.Types.ObjectId(productIdToFind);
      } else if (typeof productIdToFind !== 'object' || !(productIdToFind instanceof mongoose.Types.ObjectId) ) {
          // Xử lý nếu id_product không phải ObjectId hợp lệ, hoặc nó đã là object ObjectId
          if (typeof productIdToFind !== 'object' || !productIdToFind._id){ // Kiểm tra nếu không phải là object đã populate
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: `ID sản phẩm cha (${cartItemToUpdate.id_product}) trong cartItem không hợp lệ.` });
          }
      }


      const productDoc = await Product.findById(productIdToFind).session(session);
      if (!productDoc) {
        // Xử lý trường hợp sản phẩm không còn tồn tại (có thể xóa item khỏi giỏ)
        cart.cartItem.pull({ _id: cartItemId });
        await cart.save({ session }); // Lưu lại giỏ hàng sau khi xóa item lỗi
        await session.commitTransaction();
        session.endSession();
        return res.status(404).json({ message: `Sản phẩm gốc (ID: ${cartItemToUpdate.id_product}) của mục này không còn tồn tại. Mục đã được xóa khỏi giỏ.` });
      }

      // 2. Kiểm tra tồn kho (variant_stock trong Product.variant)
      if (productDoc.stock < newQuantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `Sản phẩm "${productDoc.name_Product} - ${productDoc.size}" không đủ số lượng tồn kho (Còn: ${productDoc.stock}, Yêu cầu: ${newQuantity}).`,
          currentStock: productDoc.stock,
          requestedQuantity: newQuantity
        });
      }

      // 3. Cập nhật quantity cho cartItem
      cartItemToUpdate.quantity = newQuantity;
      // Bạn có thể muốn cập nhật lại price, name, image trong cartItem ở đây nếu chúng có thể thay đổi
      // và bạn muốn giỏ hàng phản ánh giá mới nhất. Tuy nhiên, thường thì giá trong giỏ là giá tại thời điểm thêm.
      cartItemToUpdate.price = productDoc.price; // Ví dụ nếu muốn cập nhật giá mới nhất
      cartItemToUpdate.name_product = productDoc.name_Product; // Ví dụ nếu muốn cập nhật name mới nhất
      cartItemToUpdate.image = productDoc.image; // Ví dụ nếu muốn cập nhật image mới nhất
    }

    // Hook pre('save') trong CartSchema sẽ tự động gọi recalculateCartSubtotal
    // và cập nhật this.totalPrice dựa trên các item có status: true
    const updatedCart = await cart.save({ session });

    await session.commitTransaction();
    console.log("Service: Cập nhật số lượng cartItem thành công, cartId:", cart._id);
    return updatedCart

  } catch (error) {
    await session.abortTransaction();
    console.error("Service: Lỗi khi cập nhật số lượng cartItem:", error.message, error.stack);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || 'Lỗi máy chủ nội bộ.' });
  } finally {
    session.endSession();
  }
};