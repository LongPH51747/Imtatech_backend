const ChatRoom = require('./chat.model');
const Message = require('../messages/message.model');
const User = require('../user/user.model');

/**
 * Tạo phòng chat mới
 * @param {Object} data - Dữ liệu phòng chat
 * @param {string} data.userId - ID người dùng
 * @param {string} data.adminId - ID admin
 * @returns {Promise<Object>} Phòng chat đã tạo
 */
exports.createChatRoom = async (data) => {
  try {
    const { userId, adminId } = data;
    
    // Kiểm tra người dùng và admin có tồn tại không
    const user = await User.findById(userId);
    const admin = await User.findById(adminId);
    
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }
    
    if (!admin) {
      throw new Error('Không tìm thấy admin');
    }
    
    // Kiểm tra phòng chat đã tồn tại chưa
    const existingRoom = await ChatRoom.findOne({ user: userId, admin: adminId });
    if (existingRoom) {
      throw new Error('Phòng chat đã tồn tại');
    }
    
    const chatRoom = await ChatRoom.create({
      user: userId,
      admin: adminId
    });
    
    return await chatRoom.populate(['user', 'admin']);
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy tất cả phòng chat của người dùng
 * @param {string} userId - ID người dùng
 * @param {string} role - Vai trò ('user' hoặc 'admin')
 * @returns {Promise<Array>} Danh sách phòng chat
 */
exports.getChatRooms = async (userId, role = 'user') => {
  try {
    const query = role === 'admin' ? { admin: userId } : { user: userId };
    
    const chatRooms = await ChatRoom.find(query)
      .populate('user', 'name email avatar')
      .populate('admin', 'name email avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });
    
    return chatRooms;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy thông tin phòng chat cụ thể
 * @param {string} chatRoomId - ID phòng chat
 * @returns {Promise<Object>} Thông tin phòng chat
 */
exports.getChatRoom = async (chatRoomId) => {
  try {
    const chatRoom = await ChatRoom.findById(chatRoomId)
      .populate('user', 'name email avatar')
      .populate('admin', 'name email avatar')
      .populate('lastMessage');
    
    if (!chatRoom) {
      throw new Error('Không tìm thấy phòng chat');
    }
    
    return chatRoom;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy tin nhắn trong phòng chat
 * @param {string} chatRoomId - ID phòng chat
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng tin nhắn mỗi trang
 * @returns {Promise<Object>} Danh sách tin nhắn và thông tin phân trang
 */
exports.getChatMessages = async (chatRoomId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({ chatRoomId })
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Message.countDocuments({ chatRoomId });
    
    return {
      messages: messages.reverse(), // Đảo ngược mảng để hiển thị theo thứ tự thời gian
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Gửi tin nhắn
 * @param {Object} data - Dữ liệu tin nhắn
 * @param {string} data.chatRoomId - ID phòng chat
 * @param {string} data.senderId - ID người gửi
 * @param {string} data.receiverId - ID người nhận
 * @param {string} data.content - Nội dung tin nhắn
 * @param {string} data.messageType - Loại tin nhắn
 * @param {string} data.mediaUrl - URL media
 * @returns {Promise<Object>} Tin nhắn đã tạo
 */
exports.sendMessage = async (data) => {
  try {
    const { chatRoomId, senderId, receiverId, content, messageType = 'text', mediaUrl } = data;
    
    // Kiểm tra phòng chat có tồn tại không
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      throw new Error('Không tìm thấy phòng chat');
    }
    
    // Kiểm tra người gửi và người nhận
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    
    if (!sender || !receiver) {
      throw new Error('Người gửi hoặc người nhận không tồn tại');
    }
    
    // Tạo tin nhắn
    const messageData = {
      chatRoomId,
      sender: senderId,
      receiver: receiverId,
      messageType
    };
    
    if (messageType === 'text') {
      if (!content) {
        throw new Error('Nội dung tin nhắn không được để trống');
      }
      messageData.content = content;
    } else {
      if (!mediaUrl) {
        throw new Error('URL media không được để trống');
      }
      messageData.mediaUrl = mediaUrl;
    }
    
    const message = await Message.create(messageData);
    
    // Cập nhật thông tin tin nhắn cuối cùng trong phòng chat
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
    if (senderId === chatRoom.user.toString()) {
      updateData.unreadCountAdmin = (chatRoom.unreadCountAdmin || 0) + 1;
    } else {
      updateData.unreadCountUser = (chatRoom.unreadCountUser || 0) + 1;
    }
    
    await ChatRoom.findByIdAndUpdate(chatRoomId, updateData);
    
    return await message.populate(['sender', 'receiver']);
  } catch (error) {
    throw error;
  }
};

/**
 * Đánh dấu tin nhắn đã đọc
 * @param {string} chatRoomId - ID phòng chat
 * @param {string} userId - ID người dùng
 * @returns {Promise<Object>} Kết quả cập nhật
 */
exports.markAsRead = async (chatRoomId, userId) => {
  try {
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      throw new Error('Không tìm thấy phòng chat');
    }
    
    // Đánh dấu tin nhắn đã đọc
    await Message.updateMany(
      { 
        chatRoomId, 
        receiver: userId,
        readBy: { $ne: userId }
      },
      { $push: { readBy: userId } }
    );
    
    // Reset số tin nhắn chưa đọc
    const updateData = {};
    if (userId === chatRoom.user.toString()) {
      updateData.unreadCountUser = 0;
    } else if (userId === chatRoom.admin.toString()) {
      updateData.unreadCountAdmin = 0;
    }
    
    await ChatRoom.findByIdAndUpdate(chatRoomId, updateData);
    
    return { success: true };
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa phòng chat
 * @param {string} chatRoomId - ID phòng chat
 * @returns {Promise<Object>} Kết quả xóa
 */
exports.deleteChatRoom = async (chatRoomId) => {
  try {
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      throw new Error('Không tìm thấy phòng chat');
    }
    
    // Xóa tất cả tin nhắn trong phòng chat
    await Message.deleteMany({ chatRoomId });
    
    // Xóa phòng chat
    await ChatRoom.findByIdAndDelete(chatRoomId);
    
    return { success: true };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy số lượng tin nhắn chưa đọc
 * @param {string} userId - ID người dùng
 * @param {string} role - Vai trò ('user' hoặc 'admin')
 * @returns {Promise<number>} Số lượng tin nhắn chưa đọc
 */
exports.getUnreadCount = async (userId, role = 'user') => {
  try {
    const query = role === 'admin' ? { admin: userId } : { user: userId };
    const field = role === 'admin' ? 'unreadCountAdmin' : 'unreadCountUser';
    
    const result = await ChatRoom.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: `$${field}` } } }
    ]);
    
    return result.length > 0 ? result[0].total : 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Tìm kiếm phòng chat
 * @param {string} userId - ID người dùng
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @param {string} role - Vai trò ('user' hoặc 'admin')
 * @returns {Promise<Array>} Kết quả tìm kiếm
 */
exports.searchChatRooms = async (userId, searchTerm, role = 'user') => {
  try {
    const query = role === 'admin' ? { admin: userId } : { user: userId };
    
    const chatRooms = await ChatRoom.find(query)
      .populate({
        path: role === 'admin' ? 'user' : 'admin',
        match: {
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } }
          ]
        },
        select: 'name email avatar'
      })
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });
    
    // Lọc bỏ các phòng chat không có người dùng phù hợp
    return chatRooms.filter(room => room[role === 'admin' ? 'user' : 'admin']);
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy thống kê chat
 * @param {string} userId - ID người dùng
 * @param {string} role - Vai trò ('user' hoặc 'admin')
 * @returns {Promise<Object>} Thống kê
 */
exports.getChatStats = async (userId, role = 'user') => {
  try {
    const query = role === 'admin' ? { admin: userId } : { user: userId };
    const field = role === 'admin' ? 'unreadCountAdmin' : 'unreadCountUser';
    
    const stats = await ChatRoom.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRooms: { $sum: 1 },
          totalUnread: { $sum: `$${field}` },
          activeRooms: {
            $sum: {
              $cond: [
                { $gt: ['$lastMessageAt', new Date(Date.now() - 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    return stats.length > 0 ? stats[0] : {
      totalRooms: 0,
      totalUnread: 0,
      activeRooms: 0
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy tin nhắn cuối cùng của mỗi phòng chat
 * @param {string} userId - ID người dùng
 * @param {string} role - Vai trò ('user' hoặc 'admin')
 * @returns {Promise<Array>} Danh sách tin nhắn cuối cùng
 */
exports.getLastMessages = async (userId, role = 'user') => {
  try {
    const query = role === 'admin' ? { admin: userId } : { user: userId };
    
    const chatRooms = await ChatRoom.find(query)
      .populate('lastMessage')
      .populate('user', 'name email avatar')
      .populate('admin', 'name email avatar')
      .sort({ lastMessageAt: -1 });
    
    return chatRooms.filter(room => room.lastMessage);
  } catch (error) {
    throw error;
  }
};
