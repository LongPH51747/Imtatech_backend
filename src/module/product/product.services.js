const Product = require("./product.model");

exports.create = async (createProduct) => {
  try {
    const data = new Product({
      name_Product: createProduct.name_Product,
      id_cate: createProduct.id_cate,
      image: createProduct.image,
      price: createProduct.price,
      stock: createProduct.stock,
      origin: createProduct.origin,
      attribute: createProduct.attribute,
      size: createProduct.size,
      sold: createProduct.sold,
      rate: createProduct.rate,
    });
    const saveData = await data.save();
    return saveData;
  } catch (error) {
    console.log(error);
  }
};

exports.getById = async (id) => {
  try {
    const product = await Product.findById(id);
    return product;
  } catch (error) {
    console.log(error);
  }
};

exports.get = async (id) => {
  try {
    const product = await Product.find();
    return product;
  } catch (error) {
    console.log(error);
  }
};
