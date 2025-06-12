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
      .json(saveProduct );
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
    return res.status(200).json( productData );
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
    return res.status(200).json(productData );
  } catch (error) {
    console.log(error);
  }
};

exports.update = async (req, res) => {
  try {
    const data = req.body
    const {id} = req.params
    const updateProduct = await productServices.update(data, id)
    if (!updateProduct) {
      res.status(404).json({message: "Cannot found product"})
    }
    return res.status(200).json(updateProduct)
  } catch (error) {
    console.log(error);
    throw error
  }
}

exports.delete = async (req, res) => {
  try {
    const {id} = req.params
    const deleteProd = await productServices.delete(id)
    if (!deleteProd) {
      return res.status(404).json({message: "Cannot found Product"})
    }
    return res.status(200).json(deleteProd)
  } catch (error) {
    console.log(error);
    throw error
  }
}


exports.searchProduct = async(req, res, next) =>{
    try {
        const {q, categoryId} = req.query
        const result = await productService.searchProduct( q || '', categoryId)
        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}