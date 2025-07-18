const Product = require("./product.model");
const path = require("path");
const sharp = require("sharp");

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
    });
    const saveData = await data.save();
    return saveData;
  } catch (error) {
    console.log(error);
  }
};

exports.createProduct = async (data, { image }) => {
  // Xử lý ảnh chính
  console.log("image 2", image);
  console.log("image buffer", image?.buffer);
  
  const productImagePath = image
    ? await saveImageToDisk(image?.buffer, "product")
    : null;

  // Gán ảnh chính vào data
  console.log("productImagePath", productImagePath);
  
  data.image = productImagePath;

  // Tạo sản phẩm bằng Mongoose
  const product = await Product.create(data);
  return product;
};

const saveImageToDisk = async (buffer, namePrefix) => {
  const fileName = `${namePrefix}-${Date.now()}.jpg`;
  const filePath = path.join(
    __dirname,
    "../../public/uploads_product",
    fileName
  );
  await sharp(buffer).resize(800).jpeg({ quality: 80 }).toFile(filePath);
  return `/uploads_product/${fileName}`; // Đường dẫn public
};

exports.getById = async (id) => {
  try {
    const product = await Product.findById(id);
    return product;
  } catch (error) {
    console.log(error);
  }
};

exports.get = async () => {
  try {
    const product = await Product.find();
    return product;
  } catch (error) {
    console.log(error);
  }
};

exports.getAllProductsLimit = async (page, limit) => {
  const skip = (page - 1) * limit;

  const products = await Product.find()
    .skip(skip)
    .limit(limit)
    .populate("id_cate")
    .exec();

  const total = await Product.countDocuments();

  return {
    products,
    total,
  };
};

// exports.update = async (data, id) => {
//   try {
//     const updateProduct = await Product.findById(id);
//     if (!updateProduct) {
//       return;
//     }
//     updateProduct.name_Product = data.name_Product;
//     updateProduct.price = data.price;
//     updateProduct.size = data.size;
//     updateProduct.stock = data.stock;
//     updateProduct.origin = data.origin;
//     updateProduct.attribute = data.attribute;
//     updateProduct.image = data.image;
//     updateProduct.id_cate = data.id_cate;
//     const saveProduct = await updateProduct.save();
//     return saveProduct;
//   } catch (error) {}
// };

exports.delete = async (id) => {
  try {
    const deleteById = await Product.findByIdAndDelete(id);
    return deleteById;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.searchProduct = async (query, categoryId) => {
  const keyword = new RegExp(query, "i");
  const condition = {
    $or: [
      { name_Product: keyword }, // theo tên
    ],
  };

  if (categoryId) {
    // nếu có thêm cái id của bọn danh mục để lọc
    condition.id_cate = categoryId;
  }

  return await Product.find(condition).populate("id_cate").exec();
};

exports.updateStatusToTrue = async (id) => {
  try {
    const product = await Product.findById(id);
    if (!product) {
      const error = new Error("Cannot found product");
      error.statusCode = 404;
      throw error;
    }
    product.status = true;
    const saveStatus = await product.save();
    return saveStatus;
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }
};

exports.updateStatusToFalse = async (id) => {
  try {
    const product = await Product.findById(id);
    if (!product) {
      const error = new Error("Cannot found product");
      error.statusCode = 404;
      throw error;
    }
    product.status = false;
    const saveStatus = await product.save();
    return saveStatus;
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }
};

// Cap nhat toan bo san pham
exports.updateProduct = async (id, data, file = null) => {
  const {
    name_Product,
    price,
    id_cate,
    size,
    color,
    stock,
    origin,
    attribute,
    status,
    image, // Trường hợp truyền file ảnh
  } = data;

  const product = await this.getById(id);
  if (!product) throw new Error("Không tồn tại sản phẩm này");

  if (name_Product) product.name_Product = name_Product;
  if (price) product.price = price;
  if (id_cate) product.id_cate = id_cate;
  if (size) product.size = size;
  if (color) product.color = color;
  if (stock) product.stock = stock
  if (origin) product.origin = origin;
  if (attribute) product.attribute = attribute;
  if (status) product.status = status;

  if (file?.buffer) {
    const filePath = await saveImageToDisk(
      file.buffer,
      `product-${product._id}`
    );
    product.image = filePath; // Cập nhật đường dẫn ảnh mới
  }

  return await product.save();
};
