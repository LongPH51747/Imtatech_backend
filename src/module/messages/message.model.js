const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
        chatRoomId:{ 
        type:mongoose.Types.ObjectId,
        ref: 'ChatRoom',
        required: true,
    },
        sender: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
    },
        receiver: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
    },
        content: {
            type: String,
            required: function(){
            return this.messageType === 'text';
            }
    },
        messageType: {
            type: String,
            enum: ['text', 'image', 'video'],
            default: 'text',
    },
        mediaUrl: {
            type: String,
             required: function(){
            return this.messageType !== 'text'; 
        }
    },
        readBy: [{
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }]
},{
    timestamps: true
})

module.exports = mongoose.model('Message', messageSchema)