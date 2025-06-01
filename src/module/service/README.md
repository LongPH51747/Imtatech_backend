ae code các logic ở đây nhé
vd: 
const Product = require("./product.model");

exports.create = async (createProduct) => {
  try {
    // const variant = await createProduct.variant;
    // const processedVariant = [];

    // for (const item of variant) {
    //   processedVariant.push({
    //     color: item.color,
    //     size: item.size,
    //     price: item.price,
    //     amount: item.amount,
    //   });
    // }

    const data = new Product({
      name_Product: createProduct.name_Product,
    //   variant: processedVariant,
      description: createProduct.description,
      sold: createProduct.sold,
      rate: createProduct.rate,
    });
    const saveData = await data.save();

    return saveData;
  } catch (error) {
    console.log(error);
  }
};