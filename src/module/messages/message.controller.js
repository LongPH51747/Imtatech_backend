const messageService = require('./message.service');

/**
 * Tạo tin nhắn mới
 * POST /api/messages
 */
exports.createMessage = async (req, res) => {
    try {
        const { chatRoomId, receiverId, content, messageType, mediaUrl } = req.body;
        
        // Kiểm tra xác thực người dùng
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                error: 'Bạn cần đăng nhập để thực hiện hành động này'
            });
        }
        
        const senderId = req.user._id;

        // Kiểm tra các trường bắt buộc
        if (!chatRoomId || !receiverId) {
            return res.status(400).json({ 
                error: 'Vui lòng cung cấp chatRoomId và receiverId' 
            });
        }

        // Kiểm tra người gửi và người nhận
        if (senderId.toString() === receiverId) {
            return res.status(400).json({
                error: 'Không thể gửi tin nhắn cho chính mình'
            });
        }

        if (messageType === 'text' && (!content || content.trim() === '')) {
            return res.status(400).json({ 
                error: 'Nội dung tin nhắn không được để trống' 
            });
        }

        if (['image', 'video'].includes(messageType) && (!mediaUrl || mediaUrl.trim() === '')) {
            return res.status(400).json({ 
                error: 'URL media không được để trống' 
            });
        }

        const message = await messageService.createMessage({
            chatRoomId,
            senderId,
            receiverId,
            content,
            messageType: messageType || 'text',
            mediaUrl
        });

        res.status(201).json({ 
            message: 'Tạo tin nhắn thành công', 
            data: message 
        });
    } catch (err) {
        console.error('Lỗi khi tạo tin nhắn:', err);
        res.status(400).json({ error: err.message });
    }
};

/**
 * Lấy tin nhắn theo ID
 * GET /api/messages/:messageId
 */
exports.getMessageById = async (req, res) => {
    try {
        const { messageId } = req.params;
        
        const message = await messageService.getMessageById(messageId);
        res.status(200).json({ 
            message: 'Lấy tin nhắn thành công', 
            data: message 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Lấy tin nhắn trong phòng chat
 * GET /api/messages/chat-room/:chatRoomId
 */
exports.getMessagesByChatRoom = async (req, res) => {
    try {
        const { chatRoomId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const messageType = req.query.messageType || null;
        
        const result = await messageService.getMessagesByChatRoom(chatRoomId, page, limit, messageType);
        res.status(200).json({ 
            message: 'Lấy tin nhắn thành công', 
            ...result 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Lấy tin nhắn theo người gửi
 * GET /api/messages/sender/:senderId
 */
exports.getMessagesBySender = async (req, res) => {
    try {
        const { senderId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const result = await messageService.getMessagesBySender(senderId, page, limit);
        res.status(200).json({ 
            message: 'Lấy tin nhắn theo người gửi thành công', 
            ...result 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Lấy tin nhắn theo người nhận
 * GET /api/messages/receiver/:receiverId
 */
exports.getMessagesByReceiver = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const result = await messageService.getMessagesByReceiver(receiverId, page, limit);
        res.status(200).json({ 
            message: 'Lấy tin nhắn theo người nhận thành công', 
            ...result 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Đánh dấu tin nhắn đã đọc
 * PUT /api/messages/:messageId/read
 */
exports.markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id; // Lấy từ middleware auth
        
        const result = await messageService.markMessageAsRead(messageId, userId);
        res.status(200).json({ 
            message: 'Đánh dấu tin nhắn đã đọc thành công', 
            ...result 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Đánh dấu tất cả tin nhắn trong phòng chat đã đọc
 * PUT /api/messages/chat-room/:chatRoomId/read-all
 */
exports.markAllMessagesAsRead = async (req, res) => {
    try {
        const { chatRoomId } = req.params;
        const userId = req.user._id; // Lấy từ middleware auth
        
        const result = await messageService.markAllMessagesAsRead(chatRoomId, userId);
        res.status(200).json({ 
            message: 'Đánh dấu tất cả tin nhắn đã đọc thành công', 
            ...result 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Cập nhật tin nhắn
 * PUT /api/messages/:messageId
 */
exports.updateMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id; // Lấy từ middleware auth
        const updateData = req.body;
        
        if (!updateData.content || updateData.content.trim() === '') {
            return res.status(400).json({ 
                error: 'Nội dung tin nhắn không được để trống' 
            });
        }

        const message = await messageService.updateMessage(messageId, userId, updateData);
        res.status(200).json({ 
            message: 'Cập nhật tin nhắn thành công', 
            data: message 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Xóa tin nhắn
 * DELETE /api/messages/:messageId
 */
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id; // Lấy từ middleware auth
        
        const result = await messageService.deleteMessage(messageId, userId);
        res.status(200).json({ 
            message: 'Xóa tin nhắn thành công', 
            ...result 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Tìm kiếm tin nhắn
 * GET /api/messages/search/:chatRoomId
 */
exports.searchMessages = async (req, res) => {
    try {
        const { chatRoomId } = req.params;
        const { searchTerm } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        if (!searchTerm || searchTerm.trim() === '') {
            return res.status(400).json({ 
                error: 'Vui lòng cung cấp từ khóa tìm kiếm' 
            });
        }

        const result = await messageService.searchMessages(chatRoomId, searchTerm.trim(), page, limit);
        res.status(200).json({ 
            message: 'Tìm kiếm tin nhắn thành công', 
            ...result 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Lấy thống kê tin nhắn
 * GET /api/messages/stats/:chatRoomId
 */
exports.getMessageStats = async (req, res) => {
    try {
        const { chatRoomId } = req.params;
        
        const stats = await messageService.getMessageStats(chatRoomId);
        res.status(200).json({ 
            message: 'Lấy thống kê tin nhắn thành công', 
            stats 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Lấy tin nhắn chưa đọc của người dùng
 * GET /api/messages/unread
 */
exports.getUnreadMessages = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy từ middleware auth
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const result = await messageService.getUnreadMessages(userId, page, limit);
        res.status(200).json({ 
            message: 'Lấy tin nhắn chưa đọc thành công', 
            ...result 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Lấy tin nhắn của người dùng hiện tại (đã gửi hoặc nhận)
 * GET /api/messages/my-messages
 */
exports.getMyMessages = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy từ middleware auth
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const type = req.query.type || 'all'; // 'sent', 'received', 'all'
        
        let result;
        
        switch (type) {
            case 'sent':
                result = await messageService.getMessagesBySender(userId, page, limit);
                break;
            case 'received':
                result = await messageService.getMessagesByReceiver(userId, page, limit);
                break;
            case 'all':
            default:
                // Lấy cả tin nhắn đã gửi và nhận
                const [sentMessages, receivedMessages] = await Promise.all([
                    messageService.getMessagesBySender(userId, page, limit),
                    messageService.getMessagesByReceiver(userId, page, limit)
                ]);
                
                // Gộp và sắp xếp theo thời gian
                const allMessages = [...sentMessages.messages, ...receivedMessages.messages];
                allMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                result = {
                    messages: allMessages.slice(0, limit),
                    pagination: {
                        page,
                        limit,
                        total: sentMessages.pagination.total + receivedMessages.pagination.total,
                        pages: Math.ceil((sentMessages.pagination.total + receivedMessages.pagination.total) / limit)
                    }
                };
                break;
        }
        
        res.status(200).json({ 
            message: 'Lấy tin nhắn thành công', 
            ...result 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Lấy tin nhắn theo loại
 * GET /api/messages/type/:messageType
 */
exports.getMessagesByType = async (req, res) => {
    try {
        const { messageType } = req.params;
        const userId = req.user._id; // Lấy từ middleware auth
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        if (!['text', 'image', 'video'].includes(messageType)) {
            return res.status(400).json({ 
                error: 'Loại tin nhắn không hợp lệ' 
            });
        }

        // Lấy tin nhắn theo loại từ tất cả phòng chat của user
        const result = await messageService.getMessagesByChatRoom(null, page, limit, messageType);
        res.status(200).json({ 
            message: `Lấy tin nhắn loại ${messageType} thành công`, 
            ...result 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
