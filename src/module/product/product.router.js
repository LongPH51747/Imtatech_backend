const express = require("express");
const router = express.Router();
const productContronller = require("./product.contronller");

router.post("/create", async (req, res) => {
  await productContronller.create(req, res);
});

router.get("/get", async (req, res) => {
  await productContronller.get(req, res);
});

router.get("/getById/:id", async (req, res) => {
  await productContronller.getById(req, res);
});

router.put('/updateProdById/:id', productContronller.update)

router.delete('/delete/:id', productContronller.delete)

router.get('/search-product', productController.searchProduct)

module.exports = router;
