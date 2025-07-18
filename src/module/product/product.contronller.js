const productServices = require("./product.services");

exports.create = async (req, res) => {
  try {
    const createProduct = await req.body;

    const saveProduct = await productServices.create(createProduct);
    if (!saveProduct) {
      return res.status(404).json({ message: "Cannot found product" });
    }
    return res.status(200).json(saveProduct);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create product in product.contronller" });
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const data = JSON.parse(req.body.data); // Dữ liệu sản phẩm
    console.log("Data received:", data);
    console.log("Files received:", req.file);

    const image = req.file; // Ảnh chính của sản phẩm

    if (!image) {
      return res.status(400).json({
        message: "Ảnh chính của sản phẩm là bắt buộc",
      });
    }
    console.log("product_image", image);

    const reuslt = await productServices.createProduct(data, { image });

    res.status(200).json(reuslt);
  } catch (error) {
    res.status(500).json({ message: "Failed to create" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = await req.params;
    // const variant = await req.body
    const productData = await productServices.getById(id);
    if (!productData) {
      return res.status(404).json({ message: "Cannot found product" });
    }
    return res.status(200).json(productData);
  } catch (error) {
    console.log(error);
  }
};

exports.get = async (req, res) => {
  try {
    const productData = await productServices.get();
    if (!productData) {
      return res.status(404).json({ message: "Cannot found product" });
    }
    return res.status(200).json(productData);
  } catch (error) {
    console.log(error);
  }
};

exports.getAllProductsLimit = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    const { products, total } = await productServices.getAllProductsLimit(
      page,
      limit
    );

    const result = products.map((product) => {
      return {
        ...product.toObject(),
      };
    });

    res.status(200).json({
      data: result,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// exports.update = async (req, res) => {
//   try {
//     const data = req.body;
//     const { id } = req.params;
//     const updateProduct = await productServices.update(data, id);
//     if (!updateProduct) {
//       res.status(404).json({ message: "Cannot found product" });
//     }
//     return res.status(200).json(updateProduct);
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteProd = await productServices.delete(id);
    if (!deleteProd) {
      return res.status(404).json({ message: "Cannot found Product" });
    }
    return res.status(200).json(deleteProd);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.searchProduct = async (req, res, next) => {
  try {
    const { q, categoryId } = req.query;
    const result = await productServices.searchProduct(q || "", categoryId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateStatusToTrue = async (req, res) => {
  try {
    const { id } = req.params;
    const updateStatusToTrue = await productServices.updateStatusToTrue(id);
    if (!updateStatusToTrue) {
      res.status(404).json({ message: "Cannot found product" });
    }
    return res.status(200).json(updateStatusToTrue);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.updateStatusToFalse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateStatusToFalse = await productServices.updateStatusToFalse(id);
    if (!updateStatusToFalse) {
      return res.status(404).json({ message: "Cannot found product" });
    }
    return res.status(200).json(updateStatusToFalse);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log("Update product ID:", id);
    const data = req.body;
    console.log("data: ", data);
    
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (error) {
        throw new Error("Phải truyền vào một JSON hợp lệ");
      }
    }
    console.log("update product data: ", data);
    const file = req.file || null; // Ảnh sản phẩm nếu có (từ form-data)
    const result = await productServices.updateProduct(id, data, file);
    if (!result) {
      throw new Error("Loi cap nhat san pham");
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
