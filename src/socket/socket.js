// src/socket/socket.js

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
            },
            // Tăng giới hạn kích thước buffer nếu bạn gửi file trực tiếp qua socket (không khuyến nghị cho ảnh lớn)
            // Tuy nhiên, vì chúng ta đang dùng HTTP upload cho ảnh, phần này ít quan trọng hơn cho ảnh.
            // Nhưng có thể hữu ích cho các dữ liệu lớn khác qua socket.
            maxHttpBufferSize: 1e8, // 100MB
            pingInterval: 25000, // Client sẽ gửi ping mỗi 25 giây
            pingTimeout: 60000,  // Nếu client không phản hồi ping trong 60 giây, ngắt kết nối
        });

        this.connectedUsers = new Map(); // Lưu trữ user đang online (userId -> { socketId, user, connectedAt })
        this.userSockets = new Map(); // Map userId với socketId (userId -> socketId)

        this.initializeSocket();
    }

    initializeSocket() {
        this.io.use(async (socket, next) => {
            try {
                console.log(`[SOCKET] [${new Date().toISOString()}] Bắt đầu xác thực kết nối: ${socket.id}`);
                const startAuth = Date.now();
                
                const token = socket.handshake.query.token || socket.handshake.auth.token || socket.handshake.headers.authorization;
                if (!token) {
                    console.log(`[SOCKET] [${new Date().toISOString()}] Không có token, từ chối kết nối: ${socket.id}`);
                    return next(new Error('Token không được cung cấp'));
                }
                
                let decoded;
                try {
                    decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
                } catch (err) {
                    console.log(`[SOCKET] [${new Date().toISOString()}] Token không hợp lệ: ${socket.id}`);
                    return next(new Error('Token không hợp lệ'));
                }
                
                const startFindUser = Date.now();
                const user = await User.findById(decoded.id).select('-password');
                const endFindUser = Date.now();
                
                if (!user) {
                    console.log(`[SOCKET] [${new Date().toISOString()}] Không tìm thấy user: ${socket.id}`);
                    return next(new Error('Người dùng không tồn tại'));
                }
                
                socket.userId = user._id.toString();
                socket.user = user; // Lưu toàn bộ user object vào socket để dễ dàng truy cập thông tin
                
                const endAuth = Date.now();
                console.log(`[SOCKET] [${new Date().toISOString()}] Xác thực thành công: ${socket.id}, userId: ${socket.userId}, thời gian xác thực: ${endAuth - startAuth}ms, tìm user: ${endFindUser - startFindUser}ms`);
                next();
            } catch (error) {
                console.error(`[SOCKET] [${new Date().toISOString()}] Lỗi xác thực Socket:`, error.message);
                next(new Error('Token không hợp lệ'));
            }
        });

        this.io.on('connection', (socket) => {
            console.log(`[SOCKET] [${new Date().toISOString()}] User ${socket.userId} đã kết nối: ${socket.id}`);
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
        
        this.userSockets.set(userId, socket.id); // Lưu socketId của user

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
            console.log(`[SOCKET] [${new Date().toISOString()}] User ${userId} đã ngắt kết nối: ${socket.id}`);
            
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
            const joinStart = Date.now();
            try {
                const { chatRoomId } = data;
                console.log(`[SOCKET] [${new Date().toISOString()}] User ${socket.userId} yêu cầu join phòng: ${chatRoomId}`);
                const startFindRoom = Date.now();
                const chatRoom = await ChatRoom.findById(chatRoomId);
                const endFindRoom = Date.now();
                if (!chatRoom) {
                    console.log(`[SOCKET] [${new Date().toISOString()}] Không tìm thấy phòng chat: ${chatRoomId}`);
                    socket.emit('error', { message: 'Không tìm thấy phòng chat' });
                    return;
                }
                if (chatRoom.user.toString() !== socket.userId && 
                    chatRoom.admin.toString() !== socket.userId) {
                    console.log(`[SOCKET] [${new Date().toISOString()}] User ${socket.userId} không có quyền vào phòng: ${chatRoomId}`);
                    socket.emit('error', { message: 'Bạn không có quyền truy cập phòng chat này' });
                    return;
                }
                socket.join(`chat-room:${chatRoomId}`);
                const joinEnd = Date.now();
                console.log(`[SOCKET] [${new Date().toISOString()}] User ${socket.userId} đã join phòng chat: ${chatRoomId}, thời gian tìm phòng: ${endFindRoom - startFindRoom}ms, tổng thời gian xử lý: ${joinEnd - joinStart}ms`);
                socket.emit('joined:chat-room', { chatRoomId });
            } catch (error) {
                console.log(`[SOCKET] [${new Date().toISOString()}] Lỗi khi join phòng chat:`, error.message);
                socket.emit('error', { message: error.message });
            }
        });

        // Rời khỏi phòng chat
        socket.on('leave:chat-room', (data) => {
            const { chatRoomId } = data;
            socket.leave(`chat-room:${chatRoomId}`);
            console.log(`[SOCKET] [${new Date().toISOString()}] User ${socket.userId} đã rời phòng chat: ${chatRoomId}`);
            socket.emit('left:chat-room', { chatRoomId });
        });

        // Gửi tin nhắn (TEXT)
        socket.on('send:message', async (data) => {
            const sendMsgStart = Date.now();
            try {
                const { chatRoomId, receiverId, content } = data; // Đã loại bỏ messageType và mediaUrl từ destructuring
                console.log(`[SOCKET] [${new Date().toISOString()}] User ${socket.userId} gửi tin nhắn văn bản tới phòng ${chatRoomId}, receiver: ${receiverId}`);
                
                // Validation
                if (!chatRoomId || !receiverId) {
                    socket.emit('error', { message: 'Thiếu thông tin bắt buộc' });
                    return;
                }
                
                if (!content || content.trim() === '') { // Chỉ kiểm tra content cho tin nhắn text
                    socket.emit('error', { message: 'Nội dung tin nhắn không được để trống' });
                    return;
                }
                
                // Tạo tin nhắn mới
                const messageData = {
                    chatRoomId,
                    sender: socket.userId,
                    receiver: receiverId,
                    messageType: 'text', // Luôn là 'text' cho sự kiện này
                    content: content.trim() // Nội dung là content
                };

                const message = await Message.create(messageData);
                
                // Populate thông tin sender và receiver
                const populatedMessage = await message.populate([
                    { path: 'sender', select: 'name email avatar role' },
                    { path: 'receiver', select: 'name email avatar role' }
                ]);

                // Cập nhật thông tin phòng chat
                const updateData = {
                    lastMessage: populatedMessage._id,
                    lastMessageAt: new Date(),
                    lastMessageContent: populatedMessage.content // Cập nhật nội dung tin nhắn cuối cùng
                };

                const chatRoom = await ChatRoom.findById(chatRoomId);
                if (chatRoom) {
                    if (socket.userId === chatRoom.user.toString()) {
                        updateData.unreadCountAdmin = (chatRoom.unreadCountAdmin || 0) + 1;
                    } else {
                        updateData.unreadCountUser = (chatRoom.unreadCountUser || 0) + 1;
                    }
                    await ChatRoom.findByIdAndUpdate(chatRoomId, updateData);
                }

                // Gửi tin nhắn đến tất cả user trong phòng chat
                this.io.to(`chat-room:${chatRoomId}`).emit('new:message', {
                    message: populatedMessage,
                    chatRoomId: chatRoomId
                });

                // Gửi thông báo cho user nhận (nếu không online)
                const receiverSocketId = this.userSockets.get(receiverId);
                if (receiverSocketId && receiverSocketId !== socket.id) {
                    this.io.to(receiverSocketId).emit('message:notification', {
                        message: populatedMessage,
                        chatRoomId: chatRoomId
                    });
                }

                console.log(`[SOCKET] [${new Date().toISOString()}] Tin nhắn mới từ ${socket.userId} đến ${receiverId} trong phòng ${chatRoomId}`);
                const sendMsgEnd = Date.now();
                console.log(`[SOCKET] [${new Date().toISOString()}] Gửi tin nhắn thành công, thời gian xử lý: ${sendMsgEnd - sendMsgStart}ms`);
            } catch (error) {
                console.log(`[SOCKET] [${new Date().toISOString()}] Lỗi gửi tin nhắn:`, error.message);
                socket.emit('error', { message: error.message });
            }
        });

        // ==========================================================
        // LOGIC XỬ LÝ TIN NHẮN HÌNH ẢNH
        // ==========================================================
        socket.on('send:image-message', async (data) => {
            const sendImgMsgStart = Date.now();
            try {
                const { chatRoomId, receiverId, imageUrl } = data; // Nhận imageUrl từ client
                const senderId = socket.userId; // Lấy user ID từ socket.userId

                console.log(`[SOCKET] [${new Date().toISOString()}] User ${senderId} gửi ảnh tới phòng ${chatRoomId}, receiver: ${receiverId}, URL: ${imageUrl}`);

                // Validation
                if (!chatRoomId || !receiverId || !imageUrl || imageUrl.trim() === '') {
                    socket.emit('error', { message: 'Thiếu thông tin bắt buộc cho tin nhắn ảnh.' });
                    return;
                }

                // Kiểm tra quyền truy cập phòng chat
                const chatRoom = await ChatRoom.findById(chatRoomId);
                if (!chatRoom) {
                    socket.emit('error', { message: 'Không tìm thấy phòng chat.' });
                    return;
                }
                if (chatRoom.user.toString() !== senderId && chatRoom.admin.toString() !== senderId) {
                    socket.emit('error', { message: 'Bạn không có quyền gửi tin nhắn vào phòng này.' });
                    return;
                }

                // Tạo tin nhắn hình ảnh mới trong DB
                const newMessage = new Message({
                    chatRoomId: chatRoomId,
                    sender: senderId,
                    receiver: receiverId,
                    content: null,
                    mediaUrl: imageUrl.trim(),
                    messageType: 'image', // Đặt loại tin nhắn là 'image'
                    readBy: [senderId], // Đánh dấu người gửi đã đọc
                });

                await newMessage.save();

                // Cập nhật thông tin phòng chat
                const updateData = {
                    lastMessage: newMessage._id,
                    lastMessageAt: new Date(),
                    lastMessageContent: '[Image]', // Cập nhật nội dung tin nhắn cuối cùng là "[Image]"
                };

                if (senderId === chatRoom.user.toString()) {
                    updateData.unreadCountAdmin = (chatRoom.unreadCountAdmin || 0) + 1;
                } else {
                    updateData.unreadCountUser = (chatRoom.unreadCountUser || 0) + 1;
                }

                await ChatRoom.findByIdAndUpdate(chatRoomId, updateData);

                // Populate sender và receiver info trước khi gửi đi
                const populatedMessage = await Message.findById(newMessage._id)
                    .populate('sender', 'name email avatar role')
                    .populate('receiver', 'name email avatar role');

                // Gửi tin nhắn đến tất cả user trong phòng chat
                this.io.to(`chat-room:${chatRoomId}`).emit('new:message', {
                    message: populatedMessage,
                    chatRoomId: chatRoomId
                });

                // Gửi thông báo cho user nhận (nếu không online và không phải người gửi)
                if (receiverId && receiverId !== senderId) {
                    const receiverSocketId = this.userSockets.get(receiverId);
                    if (receiverSocketId) {
                        this.io.to(receiverSocketId).emit('message:notification', {
                            message: populatedMessage,
                            chatRoomId: chatRoomId
                        });
                    }
                }

                console.log(`[SOCKET] [${new Date().toISOString()}] Ảnh mới từ ${senderId} đến ${receiverId} trong phòng ${chatRoomId}`);
                const sendImgMsgEnd = Date.now();
                console.log(`[SOCKET] [${new Date().toISOString()}] Gửi ảnh thành công, thời gian xử lý: ${sendImgMsgEnd - sendImgMsgStart}ms`);
            } catch (error) {
                console.error(`[SOCKET] [${new Date().toISOString()}] Lỗi gửi ảnh:`, error.message, error);
                socket.emit('error', { message: error.message });
            }
        });
        // ==========================================================
        // KẾT THÚC LOGIC XỬ LÝ TIN NHẮN HÌNH ẢNH
        // ==========================================================


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
