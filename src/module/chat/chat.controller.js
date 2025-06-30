const chatService = require('./chat.service');

/**
 * Tạo phòng chat mới
 * POST /api/chat/rooms
 */
exports.createChatRoom = async (req, res) => {
    try {
        const { userId, adminId } = req.body;
        
        if (!userId || !adminId) {
            return res.status(400).json({ 
                error: 'Vui lòng cung cấp userId và adminId' 
            });
        }

        const chatRoom = await chatService.createChatRoom({ userId, adminId });
        res.status(201).json({ 
            message: 'Tạo phòng chat thành công', 
            chatRoom 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Lấy tất cả phòng chat của người dùng
 * GET /api/chat/rooms
 */
exports.getChatRooms = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy từ middleware auth
        const role = req.query.role || 'user'; // Mặc định là user, có thể là admin
        
        const chatRooms = await chatService.getChatRooms(userId, role);
        res.status(200).json({ 
            message: 'Lấy danh sách phòng chat thành công', 
            chatRooms 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Lấy thông tin phòng chat cụ thể
 * GET /api/chat/rooms/:chatRoomId
 */
exports.getChatRoom = async (req, res) => {
    try {
        const { chatRoomId } = req.params;
        
        const chatRoom = await chatService.getChatRoom(chatRoomId);
        res.status(200).json({ 
            message: 'Lấy thông tin phòng chat thành công', 
            chatRoom 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Lấy tin nhắn trong phòng chat
 * GET /api/chat/rooms/:chatRoomId/messages
 */
exports.getChatMessages = async (req, res) => {
    try {
        const { chatRoomId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const result = await chatService.getChatMessages(chatRoomId, page, limit);
        res.status(200).json({ 
            message: 'Lấy tin nhắn thành công', 
            ...result 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Gửi tin nhắn
 * POST /api/chat/messages
 */
exports.sendMessage = async (req, res) => {
    try {
        const { chatRoomId, receiverId, content, messageType, mediaUrl } = req.body;
        const senderId = req.user._id; // Lấy từ middleware auth
        
        if (!chatRoomId || !receiverId) {
            return res.status(400).json({ 
                error: 'Vui lòng cung cấp chatRoomId và receiverId' 
            });
        }

        if (messageType === 'text' && !content) {
            return res.status(400).json({ 
                error: 'Nội dung tin nhắn không được để trống' 
            });
        }

        if (messageType !== 'text' && !mediaUrl) {
            return res.status(400).json({ 
                error: 'URL media không được để trống' 
            });
        }

        const message = await chatService.sendMessage({
            chatRoomId,
            senderId,
            receiverId,
            content,
            messageType: messageType || 'text',
            mediaUrl
        });

        res.status(201).json({ 
            message: 'Gửi tin nhắn thành công', 
            message: message 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Đánh dấu tin nhắn đã đọc
 * PUT /api/chat/rooms/:chatRoomId/read
 */
exports.markAsRead = async (req, res) => {
    try {
        const { chatRoomId } = req.params;
        const userId = req.user._id; // Lấy từ middleware auth
        
        const result = await chatService.markAsRead(chatRoomId, userId);
        res.status(200).json({ 
            message: 'Đánh dấu đã đọc thành công', 
            ...result 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Xóa phòng chat
 * DELETE /api/chat/rooms/:chatRoomId
 */
exports.deleteChatRoom = async (req, res) => {
    try {
        const { chatRoomId } = req.params;
        
        const result = await chatService.deleteChatRoom(chatRoomId);
        res.status(200).json({ 
            message: 'Xóa phòng chat thành công', 
            ...result 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Lấy số lượng tin nhắn chưa đọc
 * GET /api/chat/unread-count
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy từ middleware auth
        const role = req.query.role || 'user';
        
        const count = await chatService.getUnreadCount(userId, role);
        res.status(200).json({ 
            message: 'Lấy số tin nhắn chưa đọc thành công', 
            unreadCount: count 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Tìm kiếm phòng chat
 * GET /api/chat/search
 */
exports.searchChatRooms = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy từ middleware auth
        const { searchTerm, role } = req.query;
        
        if (!searchTerm) {
            return res.status(400).json({ 
                error: 'Vui lòng cung cấp từ khóa tìm kiếm' 
            });
        }

        const chatRooms = await chatService.searchChatRooms(
            userId, 
            searchTerm, 
            role || 'user'
        );
        
        res.status(200).json({ 
            message: 'Tìm kiếm phòng chat thành công', 
            chatRooms 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Lấy thống kê chat
 * GET /api/chat/stats
 */
exports.getChatStats = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy từ middleware auth
        const role = req.query.role || 'user';
        
        const stats = await chatService.getChatStats(userId, role);
        res.status(200).json({ 
            message: 'Lấy thống kê chat thành công', 
            stats 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Lấy tin nhắn cuối cùng của mỗi phòng chat
 * GET /api/chat/last-messages
 */
exports.getLastMessages = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy từ middleware auth
        const role = req.query.role || 'user';
        
        const lastMessages = await chatService.getLastMessages(userId, role);
        res.status(200).json({ 
            message: 'Lấy tin nhắn cuối cùng thành công', 
            lastMessages 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Lấy phòng chat theo ID người dùng (cho admin)
 * GET /api/chat/rooms/user/:userId
 */
exports.getChatRoomByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user._id; // Admin hiện tại
        
        // Tìm phòng chat giữa user và admin
        const chatRoom = await chatService.getChatRoom({ user: userId, admin: adminId });
        
        if (!chatRoom) {
            return res.status(404).json({ 
                error: 'Không tìm thấy phòng chat với người dùng này' 
            });
        }

        res.status(200).json({ 
            message: 'Lấy phòng chat thành công', 
            chatRoom 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Lấy tất cả phòng chat (cho admin)
 * GET /api/chat/admin/rooms
 */
exports.getAllChatRooms = async (req, res) => {
    try {
        const adminId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const chatRooms = await chatService.getChatRooms(adminId, 'admin');
        
        // Phân trang
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedRooms = chatRooms.slice(startIndex, endIndex);
        
        res.status(200).json({ 
            message: 'Lấy tất cả phòng chat thành công', 
            chatRooms: paginatedRooms,
            pagination: {
                page,
                limit,
                total: chatRooms.length,
                pages: Math.ceil(chatRooms.length / limit)
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
