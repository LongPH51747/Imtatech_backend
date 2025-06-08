const Category = require('../model/Category');

exports.create = async (data) => {
    return await Category.create(data);
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
