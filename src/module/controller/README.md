ae code các controller tại đây
vd: 

const express = require("express");
const router = express.Router();
const productContronller = require("./product.contronller");

router.post("/create", async (req, res) => {
  try {
    const createProduct = await req.body;

    const saveProduct = await productServices.create(createProduct);

    return res
      .status(200)
      .json({ message: "Create success", data: saveProduct });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create product in product.contronller" });
  }
});


module.exports = router;
