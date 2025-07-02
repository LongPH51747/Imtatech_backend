// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     password: {
//         type: String,
//         required: true,
//     }
// }, {
//     timestamps: true,
// });

// module.exports = mongoose.model('User', UserSchema);

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    avatar: {
      type: String,
      default: "", // có thể dùng sau nếu hỗ trợ ảnh đại diện
    },
    is_allowed: { type: Boolean, default: true },
    role: {type: String, default:"user"}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60f7c0b8e1b1c8a1b8e1b1c8"
 *         username:
 *           type: string
 *           example: "nguyenvana"
 *         email:
 *           type: string
 *           example: "nguyenvana@gmail.com"
 *         password:
 *           type: string
 *           example: "hashed_password"
 *         role:
 *           type: string
 *           example: "user"
 *         avatar:
 *           type: string
 *         is_allowed:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
