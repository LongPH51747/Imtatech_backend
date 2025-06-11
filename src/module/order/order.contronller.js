const orderService = require("./order.services");

//cần 2 create 1 là createnow 2 là create.
//createnow chỉ chứa 1 variant còn create chứa mảng các variant hay mảng cartItem.

exports.create = async (req, res) => {
  try {
    // const { orderDetail } = req.body;
    const orderData = req.body
    const userId = orderData.userId
    console.log(orderData);

    const saveOrder = await orderService.create(orderData, userId);

    console.log("saveOrder", saveOrder);

    return res.status(200).json(saveOrder);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create", error });
  }
};

exports.get = async (req, res) => {
  try {
    const data = await orderService.get();
    return res.status(200).json(data );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Faile to get data", error });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const orderStatus = await orderService.updateStatus(status, id, res);
    return res.status(200).json(orderStatus)
  } catch (error) {
    console.log(error);
    return res.status.json({
      message: "Failed to update order status in controller",
    });
  }
};

exports.getByUserId = async(req, res) => {
  try {
    const {id} = req.params
    const dataOrderByUserID = await orderService.getOrdersByUser(id)
    if (!dataOrderByUserID) {
      return res.status(404).json({message: "Cannot found order in order.contronller"})
    }
    return res.status(200).json(dataOrderByUserID)
  } catch (error) {
    res.status(500).json({message: "Failed to get order", error})
  }
}

exports.getById = async(req, res) => {
  try {
    const {id} = req.params
    const dataOrderById = await orderService.getOrderById(id)
    if (!dataOrderById) {
      return res.status(404).json({message: 'Cannot found order'})
    }

    return res.status(200).json(dataOrderById)
  } catch (error) {
    res.status(500).json({message: "Failed to get order by ID"})
  }
}
