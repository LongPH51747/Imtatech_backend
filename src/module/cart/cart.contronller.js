const cartService = require("./cart.services");

exports.addToCart = async (req, res) => {
  try {
    const dataCart = req.body;
    const userId = dataCart.userId
    const itemData = dataCart.cartItem
    const addToCart = await cartService.addItemToCart(userId, itemData);
    if (!dataCart) {
      return res.status(404).json({ message: "Cannot found cart" });
    }

    return res
      .status(200)
      .json({ message: "Add to cart success", data: addToCart });
  } catch (error) {
    res.status(500).json({ message: "Failed to add cart" });
  }
};

exports.updateStatusToFalse = async (req, res) => {
  try {
    const {id} = req.params
    const statusFalse = await cartService.updateStatusToFalse(id)
    if (!statusFalse) {
      return res.status(404).json({message: "Cannot found to cart item"})
    }

    return res.status(200).json({message: "Update status to succees", data: statusFalse})
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Failed to update status to false", error: error})
  }
}

exports.updateStatusToTrue = async (req, res) => {
  try {
    const {id_cartItem} = req.params
    const statusTrue = await cartService.updateStatusToTrue(id_cartItem)
    if (!statusTrue) {
      return res.status(404).json({message: "Cannot found to cart item"})
    }

    return res.status(200).json({message: "Update status to succees", data: statusTrue})
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Failed to update status to false", error: error})
  }
}

exports.removeCartItem = async (req, res) => {
  try {
    const { userId } = req.body; // Lấy từ middleware xác thực (isAuthenticated)
    console.log(userId);

    const cartItemIdToRemove = req.params.cartItemId; // ID của cartItem cần xóa từ URL params
    console.log(cartItemIdToRemove);

    const removeCartItem = await cartService.removeCartItem(
      userId,
      cartItemIdToRemove,
      res
    );

    if (removeCartItem === 0) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng cho người dùng này." });
    }
    else if (removeCartItem === 1) {
      return res.status(404).json({message: "Không tìm thấy mục này trong giỏ hàng."})
    }

    return res
      .status(200)
      .json({ message: "Delete success", data: removeCartItem });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove cart item" });
  }
};

exports.updateCartItemQuantity = async(req, res) => {
  try {
    const cartItemData = req.body
    console.log(cartItemData);
    
    const {id} = req.params
    console.log(id);
    
    const newQuantity = cartItemData.newQuantity
    console.log(newQuantity);
    
    const userId = cartItemData.userId
    console.log(userId);
    
    const updateQuantity = await cartService.updateCartItemQuantity(newQuantity, id, userId)
    if (!updateQuantity) {
      return res.status(404).json({message: "Cannot found cart item"})
    }

    return res.status(200).json({message: "Update success", data: updateQuantity})
  } catch (error) {
    res.status(500).json({message: "Failed to update quantity from cart item"})
  }
}