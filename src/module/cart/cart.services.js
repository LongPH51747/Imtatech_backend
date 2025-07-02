const Cart = require("./cart.model");
// const Variant = require("../varianttest/variant.model");
const Product = require('../product/product.model')
const mongoose = require('mongoose')

exports.addItemToCart = async (userId, itemData) => {
  try {
    console.log("Service: Bắt đầu addItemToCart cho userId:", userId);
    console.log("Service: Item cần thêm/cập nhật:", itemData);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error("UserID không hợp lệ.");
      error.statusCode = 400;
      throw error;
    }

    if (!itemData || !mongoose.Types.ObjectId.isValid(itemData.id_product)) {
      const error = new Error(
        "id_product không hợp lệ hoặc itemData bị thiếu."
      );
      error.statusCode = 400;
      throw error;
    }

    if (
      typeof itemData.quantity !== "number" ||
      itemData.quantity <= 0 ||
      !Number.isInteger(itemData.quantity)
    ) {
      const error = new Error("Số lượng (quantity) không hợp lệ.");
      error.statusCode = 400;
      throw error;
    }

    // 2. Bắt đầu transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 3. Lấy thông tin sản phẩm và variant
      const product = await Product.findById(itemData.id_product).session(
        session
      );

      if (!product) {
        const error = new Error("Không tìm thấy sản phẩm.");
        error.statusCode = 404;
        throw error;
      }

      if (!product.status) {
        const error = new Error("Sản phẩm này hiện không còn kinh doanh.");
        error.statusCode = 400;
        throw error;
      }

      let image_url = "";

      if (Buffer.isBuffer(product.image)) {
        const base64 = product.image.toString("base64");
        const type = product.image || "image/png";
        image_url = `data:${type};base64,${base64}`;
      } else if (typeof product.image === "string") {
        image_url = product.image;
      }
      // 4. Kiểm tra tồn kho
      if (product.stock < itemData.quantity) {
        const error = new Error(
          `Sản phẩm "${product.name_Product}" -  Size ${product.size} chỉ còn ${product.stock} sản phẩm trong kho.`
        );
        error.statusCode = 400;
        throw error;
      }

      // 5. Tìm hoặc tạo giỏ hàng
      let cart = await Cart.findOne({ userId: userId }).session(session);

      if (!cart) {
        cart = new Cart({
          userId: userId,
          cartItem: [],
          totalPrice: 0,
        });
      }

      // 6. Kiểm tra sản phẩm đã có trong giỏ chưa
      const existingItemIndex = cart.cartItem.findIndex(
        (ci) =>
          ci.id_product &&
          ci.id_product.toString() === itemData.id_product.toString()
      );

      if (existingItemIndex > -1) {
        // Cập nhật số lượng nếu sản phẩm đã có trong giỏ
        const newQuantity =
          cart.cartItem[existingItemIndex].quantity + itemData.quantity;

        // // Kiểm tra giới hạn số lượng
        // if (newQuantity > MAX_QUANTITY_PER_ITEM) {
        //   const error = new Error(`Không thể thêm quá ${MAX_QUANTITY_PER_ITEM} sản phẩm cùng loại vào giỏ hàng`);
        //   error.statusCode = 400;
        //   throw error;
        // }

        // Kiểm tra tồn kho với số lượng mới
        if (newQuantity > product.stock) {
          const error = new Error(
            `Tổng số lượng sản phẩm trong giỏ (${newQuantity}) vượt quá số lượng tồn kho (${product.stock})`
          );
          error.statusCode = 400;
          throw error;
        }

        cart.cartItem[existingItemIndex].quantity = newQuantity;
        cart.cartItem[existingItemIndex].price = product.price; // Cập nhật giá mới nhất
        cart.cartItem[existingItemIndex].status =
          typeof itemData.status === "boolean"
            ? itemData.status
            : cart.cartItem[existingItemIndex].status;
      } else {
        // Thêm sản phẩm mới vào giỏ
        cart.cartItem.push({
          id_product: itemData.id_product,
          name_product: product.name_Product,
          price: product.price,
          size: product.size,
          image: image_url,
          quantity: itemData.quantity,
          // status: true // Mặc định là true khi thêm mới
        });
      }

      // 7. Lưu giỏ hàng
      const savedCart = await cart.save({ session });

      // 8. Commit transaction
      await session.commitTransaction();

      console.log("Service: Giỏ hàng đã được lưu thành công:", savedCart);
      return savedCart;
    } catch (error) {
      // Rollback nếu có lỗi
      await session.abortTransaction();
      throw error;
    } finally {
      // Kết thúc session
      session.endSession();
    }
  } catch (error) {
    console.error(
      "Service: Lỗi khi thêm/cập nhật giỏ hàng:",
      error.message,
      error.stack
    );
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

exports.getByUserId = async(id) => {
  try {
    if (!id) {
      const error = new Error('ID người dùng không được để trống');
      error.statusCode = 400;
      throw error;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('ID người dùng không hợp lệ');
      error.statusCode = 400;
      throw error;
    }

    const dataCartByUser = await Cart.findOne({userId: id});
    
    if (!dataCartByUser) {
      return []
    }
    
    return dataCartByUser;
  } catch (error) {
    console.error("Service getByUserId error:", error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
}