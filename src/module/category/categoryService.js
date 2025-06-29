const Category = require('../category/category.model');

exports.create = async (data) => {
    const newCate = new Category({
        name: data.name
    })
    return await newCate.save();
};

exports.getAll = async () => {
    return await Category.find();
};

exports.getById = async (id) => {
    const category = await Category.findById(id);
    if (!category) throw new Error('Không tìm thấy danh mục');
    return category;
};

exports.update = async (id, data) => {
    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!category) throw new Error('Không tìm thấy danh mục để cập nhật');
    return category;
};

exports.remove = async (id) => {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new Error('Không tìm thấy danh mục để xóa');
    return category;
};
