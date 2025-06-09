const cateService = require("./cate.services");

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    const createCate = await cateService.create(name);
    if (!createCate) {
      return res.status(40).json({ message: "Cannot found to cate" });
    }

    return res.status.json({ message: "Create success", data: createCate });
  } catch (error) {
    res.status(500).json({ message: "Failed to create", error: error });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const delteCate = await cateService.delete(id);
    if (!delteCate) {
      return res.status(40).json({ message: "Cannot found to cate" });
    }

    return res.status.json({ message: "Delete success", data: delteCate });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete", error: error });
  }
};

exports.get = async (req, res) => {
  try {
    // const { id } = req.params;
    const cateData = await cateService.get();
    if (!delteCate) {
      return res.status(40).json({ message: "Cannot found to cate" });
    }

    return res.status.json({ message: "Get success", data: cateData });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete", error: error });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const cateDataById = await cateService.getById(id);
    if (!delteCate) {
      return res.status(40).json({ message: "Cannot found to cate" });
    }

    return res.status.json({ message: "Get success", data: cateDataById });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete", error: error });
  }
};

