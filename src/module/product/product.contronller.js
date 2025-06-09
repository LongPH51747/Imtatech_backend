const productServices = require("./product.services");

exports.create = async (req, res) => {
  try {
    const createProduct = await req.body;

    const saveProduct = await productServices.create(createProduct);
    if (!saveProduct) {
      return res.status(404).json({message: "Cannot found product"})
    }
    return res
      .status(200)
      .json({ message: "Create success", data: saveProduct });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create product in product.contronller" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = await req.params;
    // const variant = await req.body
    const productData = await productServices.getById(id);
    if (!productData) {
      return res.status(404).json({message: "Cannot found product"})
    }
    return res.status(200).json({ message: "Get successs", data: productData });
  } catch (error) {
    console.log(error);
  }
};

exports.get = async (req, res) => {
  try {
    const productData = await productServices.get();
      if (!productData) {
      return res.status(404).json({message: "Cannot found product"})
    }
    return res.status(200).json({ message: "Get successs", data: productData });
  } catch (error) {
    console.log(error);
  }
};
