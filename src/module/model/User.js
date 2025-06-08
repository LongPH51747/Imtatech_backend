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


const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
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
        default: '', // có thể dùng sau nếu hỗ trợ ảnh đại diện
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
