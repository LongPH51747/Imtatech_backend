const orderService = require("./order.service(2)");

// cần 2 create 1 là createnow 2 là create.
// createnow chỉ chứa 1 variant còn create chứa mảng các variant hay mảng cartItem.

exports.create = async (req, res) => {
  try {
    // const { orderDetail } = req.body;
    const orderData = req.body;
    const { userId } = req.params;
    console.log(orderData);

    const saveOrder = await orderService.createOrder(orderData, userId);

    console.log("saveOrder", saveOrder);

    return res.status(200).json({ message: "create success", data: saveOrder });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create", error });
  }
};
