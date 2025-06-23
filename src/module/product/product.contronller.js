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
    console.log("Files received:", req.files);

    const product_image = req.files?.["image"]?.[0] || null; // Ảnh chính của sản phẩm

    if (!product_image) {
      return res.status(400).json({
        message: "Ảnh chính của sản phẩm là bắt buộc",
      });
    }
    const reuslt = await productService.createProduct(data, {
      product_image,
    });

    res.status(200).json(reuslt);
  } catch (error) {
    next(error);
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

exports.update = async (req, res) => {
  try {
    const data = req.body;
    const { id } = req.params;
    const updateProduct = await productServices.update(data, id);
    if (!updateProduct) {
      res.status(404).json({ message: "Cannot found product" });
    }
    return res.status(200).json(updateProduct);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

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
    const result = await productService.searchProduct(q || "", categoryId);
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
