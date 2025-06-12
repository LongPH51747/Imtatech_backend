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

exports.update = async (data, id) => {
  try {
    const updateProduct = await Product.findById(id)
    if (!updateProduct) {
      return
    }
    updateProduct.name_Product = data.name_Product
    updateProduct.price = data.price
    updateProduct.size = data.size
    updateProduct.stock = data.stock
    updateProduct.origin = data.origin
    updateProduct.attribute = data.attribute
    updateProduct.image = data.image
    updateProduct.id_cate = data.id_cate
    const saveProduct = await updateProduct.save()
    return saveProduct
  } catch (error) {

    
  }
}

exports.delete = async (id) => {
  try {
    const deleteById = await Product.findByIdAndDelete(id)
    return deleteById
  } catch (error) {
    console.log(error);
    throw error
  }
}

exports.searchProduct = async(query, categoryId)  =>{
    const keyword = new RegExp(query, 'i')
    const condition = {
        $or: [
            {product_name: keyword}, // theo tên
            {'product_variant.variant_color': keyword} // tạm thời để theo cả màu về sau lọc tiếp 
        ]
    }

    if (categoryId) { // nếu có thêm cái id của bọn danh mục để lọc 
        condition.product_category = categoryId
    }

    return await Product.find(condition).populate('product_category').exec()
}