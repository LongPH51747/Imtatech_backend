const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../module/user/user.model');
const ChatRoom = require('../module/chat/chat.model');
const Message = require('../module/messages/message.model');

const JWT_SECRET = "imtatech_secret"; // Nên dùng biến môi trường

class SocketManager {
    constructor(server) {
        this.io = socketIo(server, {
            cors: {
                origin: "*", // Cấu hình CORS cho frontend
                methods: ["GET", "POST"]
            }
        });
        
        this.connectedUsers = new Map(); // Lưu trữ user đang online
        this.userSockets = new Map(); // Map userId với socketId
        
        this.initializeSocket();
    }

    initializeSocket() {
        this.io.use(async (socket, next) => {
            try {
                // --- SỬA LỖI Ở ĐÂY: Thêm socket.handshake.query.token vào để tìm kiếm ---
                const token = socket.handshake.query.token || socket.handshake.auth.token || socket.handshake.headers.authorization;
                
                if (!token) {
                    return next(new Error('Token không được cung cấp'));
                }

                // Xác thực JWT token
                const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
                const user = await User.findById(decoded.id).select('-password');
                
                if (!user) {
                    return next(new Error('Người dùng không tồn tại'));
                }

                socket.userId = user._id.toString();
                socket.user = user;
                next();
            } catch (error) {
                console.error("Lỗi xác thực Socket:", error.message);
                next(new Error('Token không hợp lệ'));
            }
        });

        this.io.on('connection', (socket) => {
            console.log(`User ${socket.userId} đã kết nối: ${socket.id}`);
            
            this.handleConnection(socket);
            this.handleDisconnection(socket);
            this.handleChatEvents(socket);
        });
    }

    handleConnection(socket) {
        const userId = socket.userId;
        
        // Lưu thông tin user đang online
        this.connectedUsers.set(userId, {
            socketId: socket.id,
            user: socket.user,
            connectedAt: new Date()
        });
        
        this.userSockets.set(userId, socket.id);
        
        // Thông báo cho tất cả user khác biết user này đã online
        socket.broadcast.emit('user:online', {
            userId: userId,
            user: {
                _id: socket.user._id,
                name: socket.user.name,
                email: socket.user.email,
                avatar: socket.user.avatar
            }
        });
        
        // Gửi danh sách user đang online cho user mới kết nối
        const onlineUsers = Array.from(this.connectedUsers.values()).map(user => ({
            userId: user.user._id,
            user: {
                _id: user.user._id,
                name: user.user.name,
                email: user.user.email,
                avatar: user.user.avatar
            }
        }));
        
        socket.emit('users:online', onlineUsers);
    }

    handleDisconnection(socket) {
        socket.on('disconnect', () => {
            const userId = socket.userId;
            console.log(`User ${userId} đã ngắt kết nối: ${socket.id}`);
            
            // Xóa khỏi danh sách user đang online
            this.connectedUsers.delete(userId);
            this.userSockets.delete(userId);
            
            // Thông báo cho tất cả user khác biết user này đã offline
            socket.broadcast.emit('user:offline', {
                userId: userId
            });
        });
    }

    handleChatEvents(socket) {
        // Tham gia vào phòng chat
        socket.on('join:chat-room', async (data) => {
            try {
                const { chatRoomId } = data;
                
                // Kiểm tra quyền truy cập phòng chat
                const chatRoom = await ChatRoom.findById(chatRoomId);
                if (!chatRoom) {
                    socket.emit('error', { message: 'Không tìm thấy phòng chat' });
                    return;
                }
                
                // Kiểm tra user có trong phòng chat không
                if (chatRoom.user.toString() !== socket.userId && 
                    chatRoom.admin.toString() !== socket.userId) {
                    socket.emit('error', { message: 'Bạn không có quyền truy cập phòng chat này' });
                    return;
                }
                
                // Tham gia vào phòng chat
                socket.join(`chat-room:${chatRoomId}`);
                console.log(`User ${socket.userId} đã tham gia phòng chat: ${chatRoomId}`);
                
                socket.emit('joined:chat-room', { chatRoomId });
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Rời khỏi phòng chat
        socket.on('leave:chat-room', (data) => {
            const { chatRoomId } = data;
            socket.leave(`chat-room:${chatRoomId}`);
            console.log(`User ${socket.userId} đã rời phòng chat: ${chatRoomId}`);
            socket.emit('left:chat-room', { chatRoomId });
        });

        // Gửi tin nhắn
        socket.on('send:message', async (data) => {
            try {
                const { chatRoomId, receiverId, content, messageType = 'text', mediaUrl } = data;
                
                // Validation
                if (!chatRoomId || !receiverId) {
                    socket.emit('error', { message: 'Thiếu thông tin bắt buộc' });
                    return;
                }
                
                if (messageType === 'text' && (!content || content.trim() === '')) {
                    socket.emit('error', { message: 'Nội dung tin nhắn không được để trống' });
                    return;
                }
                
                if (['image', 'video'].includes(messageType) && (!mediaUrl || mediaUrl.trim() === '')) {
                    socket.emit('error', { message: 'URL media không được để trống' });
                    return;
                }

                // Tạo tin nhắn mới
                const messageData = {
                    chatRoomId,
                    sender: socket.userId,
                    receiver: receiverId,
                    messageType
                };

                if (messageType === 'text') {
                    messageData.content = content.trim();
                } else {
                    messageData.mediaUrl = mediaUrl.trim();
                }

                const message = await Message.create(messageData);
                
                // Populate thông tin sender và receiver
                await message.populate([
                  { path: 'sender', select: 'name email avatar role' },
                  { path: 'receiver', select: 'name email avatar role' }
                ]);

                // Cập nhật thông tin phòng chat
                const updateData = {
                    lastMessage: message._id,
                    lastMessageAt: new Date()
                };

                if (messageType === 'text') {
                    updateData.lastMessageContent = content;
                } else {
                    updateData.lastMessageContent = `[${messageType}]`;
                }

                // Cập nhật số tin nhắn chưa đọc
                const chatRoom = await ChatRoom.findById(chatRoomId);
                if (socket.userId === chatRoom.user.toString()) {
                    updateData.unreadCountAdmin = (chatRoom.unreadCountAdmin || 0) + 1;
                } else {
                    updateData.unreadCountUser = (chatRoom.unreadCountUser || 0) + 1;
                }

                await ChatRoom.findByIdAndUpdate(chatRoomId, updateData);

                // Gửi tin nhắn đến tất cả user trong phòng chat
                this.io.to(`chat-room:${chatRoomId}`).emit('new:message', {
                    message: message,
                    chatRoomId: chatRoomId
                });

                // Gửi thông báo cho user nhận (nếu không online)
                const receiverSocketId = this.userSockets.get(receiverId);
                if (receiverSocketId && receiverSocketId !== socket.id) {
                    this.io.to(receiverSocketId).emit('message:notification', {
                        message: message,
                        chatRoomId: chatRoomId
                    });
                }

                console.log(`Tin nhắn mới từ ${socket.userId} đến ${receiverId} trong phòng ${chatRoomId}`);
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Đánh dấu tin nhắn đã đọc
        socket.on('mark:read', async (data) => {
            try {
                const { chatRoomId, messageIds } = data;
                
                if (!chatRoomId || !messageIds || !Array.isArray(messageIds)) {
                    socket.emit('error', { message: 'Dữ liệu không hợp lệ' });
                    return;
                }

                // Cập nhật tin nhắn đã đọc
                await Message.updateMany(
                    {
                        _id: { $in: messageIds },
                        receiver: socket.userId,
                        readBy: { $ne: socket.userId }
                    },
                    { $addToSet: { readBy: socket.userId } }
                );

                // Reset số tin nhắn chưa đọc trong phòng chat
                const chatRoom = await ChatRoom.findById(chatRoomId);
                if (chatRoom) {
                    const updateData = {};
                    if (socket.userId === chatRoom.user.toString()) {
                        updateData.unreadCountUser = 0;
                    } else if (socket.userId === chatRoom.admin.toString()) {
                        updateData.unreadCountAdmin = 0;
                    }
                    
                    await ChatRoom.findByIdAndUpdate(chatRoomId, updateData);
                }

                // Thông báo cho tất cả user trong phòng chat
                this.io.to(`chat-room:${chatRoomId}`).emit('messages:read', {
                    chatRoomId: chatRoomId,
                    userId: socket.userId,
                    messageIds: messageIds
                });

                console.log(`User ${socket.userId} đã đánh dấu ${messageIds.length} tin nhắn đã đọc trong phòng ${chatRoomId}`);
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Typing indicator
        socket.on('typing:start', (data) => {
            const { chatRoomId } = data;
            socket.to(`chat-room:${chatRoomId}`).emit('user:typing', {
                chatRoomId: chatRoomId,
                userId: socket.userId,
                userName: socket.user.name,
                isTyping: true
            });
        });

        socket.on('typing:stop', (data) => {
            const { chatRoomId } = data;
            socket.to(`chat-room:${chatRoomId}`).emit('user:typing', {
                chatRoomId: chatRoomId,
                userId: socket.userId,
                userName: socket.user.name,
                isTyping: false
            });
        });

        // Xóa tin nhắn
        socket.on('delete:message', async (data) => {
            try {
                const { messageId, chatRoomId } = data;
                
                const message = await Message.findById(messageId);
                if (!message) {
                    socket.emit('error', { message: 'Không tìm thấy tin nhắn' });
                    return;
                }

                // Kiểm tra quyền xóa (chỉ người gửi mới được xóa)
                if (message.sender.toString() !== socket.userId) {
                    socket.emit('error', { message: 'Bạn không có quyền xóa tin nhắn này' });
                    return;
                }

                await Message.findByIdAndDelete(messageId);

                // Thông báo cho tất cả user trong phòng chat
                this.io.to(`chat-room:${chatRoomId}`).emit('message:deleted', {
                    messageId: messageId,
                    chatRoomId: chatRoomId,
                    deletedBy: socket.userId
                });

                console.log(`Tin nhắn ${messageId} đã bị xóa bởi ${socket.userId}`);
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Cập nhật tin nhắn
        socket.on('update:message', async (data) => {
            try {
                const { messageId, content, chatRoomId } = data;
                
                if (!content || content.trim() === '') {
                    socket.emit('error', { message: 'Nội dung tin nhắn không được để trống' });
                    return;
                }

                const message = await Message.findById(messageId);
                if (!message) {
                    socket.emit('error', { message: 'Không tìm thấy tin nhắn' });
                    return;
                }

                // Kiểm tra quyền cập nhật (chỉ người gửi mới được sửa)
                if (message.sender.toString() !== socket.userId) {
                    socket.emit('error', { message: 'Bạn không có quyền cập nhật tin nhắn này' });
                    return;
                }

                // Chỉ cho phép cập nhật tin nhắn text
                if (message.messageType !== 'text') {
                    socket.emit('error', { message: 'Chỉ có thể cập nhật tin nhắn text' });
                    return;
                }

                const updatedMessage = await Message.findByIdAndUpdate(
                    messageId,
                    { content: content.trim() },
                    { new: true }
                ).populate([
                  { path: 'sender', select: 'name email avatar role' },
                  { path: 'receiver', select: 'name email avatar role' }
                ]);

                // Thông báo cho tất cả user trong phòng chat
                this.io.to(`chat-room:${chatRoomId}`).emit('message:updated', {
                    message: updatedMessage,
                    chatRoomId: chatRoomId,
                    updatedBy: socket.userId
                });

                console.log(`Tin nhắn ${messageId} đã được cập nhật bởi ${socket.userId}`);
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Ping/Pong để kiểm tra kết nối
        socket.on('ping', () => {
            socket.emit('pong');
        });
    }

    // Gửi tin nhắn đến user cụ thể
    sendToUser(userId, event, data) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.io.to(socketId).emit(event, data);
        }
    }

    // Gửi tin nhắn đến tất cả user
    sendToAll(event, data) {
        this.io.emit(event, data);
    }

    // Gửi tin nhắn đến tất cả user trừ một user cụ thể
    sendToAllExcept(userId, event, data) {
        this.io.except(this.userSockets.get(userId)).emit(event, data);
    }

    // Lấy danh sách user đang online
    getOnlineUsers() {
        return Array.from(this.connectedUsers.values()).map(user => ({
            userId: user.user._id,
            user: {
                _id: user.user._id,
                name: user.user.name,
                email: user.user.email,
                avatar: user.user.avatar
            },
            connectedAt: user.connectedAt
        }));
    }

    // Kiểm tra user có online không
    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }

    // Lấy số lượng user đang online
    getOnlineCount() {
        return this.connectedUsers.size;
    }
}

module.exports = SocketManager;
