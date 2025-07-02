const mongoose = require('mongoose')

const chatRoomSchema  = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    admin: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    lastMessage: {
        type: mongoose.Types.ObjectId,
        ref: 'Message',
        default: null,
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    lastMessageContent: {
        type: String,
        default: '', // Mặc định là chuỗi rỗng
    },
     unreadCountUser: { // Số tin nhắn Admin đã gửi mà User chưa đọc
        type: Number,
        default: 0
    },
    unreadCountAdmin: { // Số tin nhắn User đã gửi mà Admin chưa đọc
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

chatRoomSchema.index({user: 1, admin: 1}, {unique: true}); // đảm bảo mỗi cặp admin - user có duy nhất 1 chat room
module.exports = mongoose.model('ChatRoom', chatRoomSchema);