const Cate = require("./cate.model");

exports.create = async (cateData) => {
  try {
    const cate = new Cate({ name: cateData });
    return cate;
  } catch (error) {
    console.log(error);
  }
};

exports.delete = async (id) => {
  try {
    const deleteCate = await Cate.findByIdAndDelete(id);
    return deleteCate;
  } catch (error) {
    console.log(error);
  }
};

exports.get = async () => {
  try {
    const data = await Cate.find()
    return data
  } catch (error) {
    console.log(error);
  }
};

exports.getById = async (id) => {
  try {
    const data = await Cate.findById(id)
    return data
  } catch (error) {
    console.log(error);
  }
};
