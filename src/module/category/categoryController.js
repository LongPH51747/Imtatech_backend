const categoryService = require('./categoryService');

exports.create = async (req, res) => {
    try {
        const category = await categoryService.create(req.body);
        res.status(201).json({ message: 'Tạo danh mục thành công', category });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const categories = await categoryService.getAll();
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const category = await categoryService.getById(req.params.id);
        res.json(category);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const updated = await categoryService.update(req.params.id, req.body);
        res.json({ message: 'Cập nhật danh mục thành công', category: updated });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.remove = async (req, res) => {
    try {
        await categoryService.remove(req.params.id);
        res.json({ message: 'Xóa danh mục thành công' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
