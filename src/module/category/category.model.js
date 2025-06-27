const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Category', CategorySchema);

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: "ObjectId của category"
 *           example: "60b8d295f1c2ae2b8a7b1a3d"
 *         name: 
 *           type: string
 *           description: "tên của danh mục"
 */