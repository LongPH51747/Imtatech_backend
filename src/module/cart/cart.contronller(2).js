const cartService = require("./cart.services(2)");

// exports.addToCart = async (req, res) => {
//   try {
//     const dataCart = req.body;
//     const userId = dataCart.userId
//     const itemData = dataCart.cartItem
//     const addToCart = await cartService.addItemToCart(userId, itemData);
//     if (!dataCart) {
//       return res.status(404).json({ message: "Cannot found cart" });
//     }

//     return res
//       .status(200)
//       .json({ message: "Add to cart success", data: addToCart });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to add cart" });
//   }
// };
// exports.deleteCartItem = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { id } = req.params;

//     const deleteCartItem = await cartService.deleteCartItem(userId, id);

//     if (!deleteCartItem) {
//       return res.status(404).json({ message: "Cannot found to cart item" });
//     }

//     return res
//       .status(200)
//       .json({ message: "Delete success", data: deleteCartItem });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to delete cart item" });
//   }
// };
