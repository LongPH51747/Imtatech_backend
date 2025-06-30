const Message = require('./message.model');
const User = require('../user/user.model');
const ChatRoom = require('../chat/chat.model');

/**
 * Tạo tin nhắn mới
 * @param {Object} data - Dữ liệu tin nhắn
 * @param {string} data.chatRoomId - ID phòng chat
 * @param {string} data.senderId - ID người gửi
 * @param {string} data.receiverId - ID người nhận
 * @param {string} data.content - Nội dung tin nhắn (cho loại text)
 * @param {string} data.messageType - Loại tin nhắn (text, image, video)
 * @param {string} data.mediaUrl - URL media (cho loại image, video)
 * @returns {Promise<Object>} Tin nhắn đã tạo
 */
exports.createMessage = async (data) => {
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
    
    // Tạo dữ liệu tin nhắn
    const messageData = {
      chatRoomId,
      sender: senderId,
      receiver: receiverId,
      messageType
    };
    
    // Validation theo loại tin nhắn
    if (messageType === 'text') {
      if (!content || content.trim() === '') {
        throw new Error('Nội dung tin nhắn không được để trống');
      }
      messageData.content = content.trim();
    } else if (['image', 'video'].includes(messageType)) {
      if (!mediaUrl || mediaUrl.trim() === '') {
        throw new Error('URL media không được để trống');
      }
      messageData.mediaUrl = mediaUrl.trim();
    } else {
      throw new Error('Loại tin nhắn không hợp lệ');
    }
    
    const message = await Message.create(messageData);
    
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
 * Lấy tin nhắn theo ID
 * @param {string} messageId - ID tin nhắn
 * @returns {Promise<Object>} Tin nhắn
 */
exports.getMessageById = async (messageId) => {
  try {
    const message = await Message.findById(messageId)
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .populate('readBy', 'name email avatar');
    
    if (!message) {
      throw new Error('Không tìm thấy tin nhắn');
    }
    
    return message;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy tin nhắn trong phòng chat
 * @param {string} chatRoomId - ID phòng chat
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng tin nhắn mỗi trang
 * @param {string} messageType - Lọc theo loại tin nhắn (optional)
 * @returns {Promise<Object>} Danh sách tin nhắn và thông tin phân trang
 */
exports.getMessagesByChatRoom = async (chatRoomId, page = 1, limit = 20, messageType = null) => {
  try {
    const skip = (page - 1) * limit;
    
    // Xây dựng query
    const query = { chatRoomId };
    if (messageType) {
      query.messageType = messageType;
    }
    
    const messages = await Message.find(query)
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .populate('readBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Message.countDocuments(query);
    
    return {
      messages: messages.reverse(), // Đảo ngược để hiển thị theo thứ tự thời gian
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
 * Lấy tin nhắn theo người gửi
 * @param {string} senderId - ID người gửi
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng tin nhắn mỗi trang
 * @returns {Promise<Object>} Danh sách tin nhắn
 */
exports.getMessagesBySender = async (senderId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({ sender: senderId })
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .populate('chatRoomId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Message.countDocuments({ sender: senderId });
    
    return {
      messages,
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
 * Lấy tin nhắn theo người nhận
 * @param {string} receiverId - ID người nhận
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng tin nhắn mỗi trang
 * @returns {Promise<Object>} Danh sách tin nhắn
 */
exports.getMessagesByReceiver = async (receiverId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({ receiver: receiverId })
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .populate('chatRoomId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Message.countDocuments({ receiver: receiverId });
    
    return {
      messages,
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
 * Đánh dấu tin nhắn đã đọc
 * @param {string} messageId - ID tin nhắn
 * @param {string} userId - ID người dùng
 * @returns {Promise<Object>} Kết quả cập nhật
 */
exports.markMessageAsRead = async (messageId, userId) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Không tìm thấy tin nhắn');
    }
    
    // Kiểm tra người dùng có phải là người nhận không
    if (message.receiver.toString() !== userId) {
      throw new Error('Bạn không có quyền đánh dấu tin nhắn này');
    }
    
    // Kiểm tra tin nhắn đã được đọc chưa
    if (message.readBy.includes(userId)) {
      return { success: true, message: 'Tin nhắn đã được đọc trước đó' };
    }
    
    // Thêm người dùng vào danh sách đã đọc
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { readBy: userId }
    });
    
    return { success: true, message: 'Đánh dấu đã đọc thành công' };
  } catch (error) {
    throw error;
  }
};

/**
 * Đánh dấu tất cả tin nhắn trong phòng chat đã đọc
 * @param {string} chatRoomId - ID phòng chat
 * @param {string} userId - ID người dùng
 * @returns {Promise<Object>} Kết quả cập nhật
 */
exports.markAllMessagesAsRead = async (chatRoomId, userId) => {
  try {
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      throw new Error('Không tìm thấy phòng chat');
    }
    
    // Cập nhật tất cả tin nhắn chưa đọc trong phòng chat
    const result = await Message.updateMany(
      { 
        chatRoomId, 
        receiver: userId,
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );
    
    // Reset số tin nhắn chưa đọc trong phòng chat
    const updateData = {};
    if (userId === chatRoom.user.toString()) {
      updateData.unreadCountUser = 0;
    } else if (userId === chatRoom.admin.toString()) {
      updateData.unreadCountAdmin = 0;
    }
    
    await ChatRoom.findByIdAndUpdate(chatRoomId, updateData);
    
    return { 
      success: true, 
      message: `Đã đánh dấu ${result.modifiedCount} tin nhắn đã đọc` 
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật tin nhắn
 * @param {string} messageId - ID tin nhắn
 * @param {string} userId - ID người dùng (để kiểm tra quyền)
 * @param {Object} updateData - Dữ liệu cập nhật
 * @returns {Promise<Object>} Tin nhắn đã cập nhật
 */
exports.updateMessage = async (messageId, userId, updateData) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Không tìm thấy tin nhắn');
    }
    
    // Kiểm tra quyền chỉnh sửa (chỉ người gửi mới được sửa)
    if (message.sender.toString() !== userId) {
      throw new Error('Bạn không có quyền chỉnh sửa tin nhắn này');
    }
    
    // Chỉ cho phép cập nhật nội dung tin nhắn text
    if (message.messageType !== 'text') {
      throw new Error('Chỉ có thể cập nhật tin nhắn text');
    }
    
    const allowedFields = ['content'];
    const filteredData = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }
    
    if (Object.keys(filteredData).length === 0) {
      throw new Error('Không có dữ liệu hợp lệ để cập nhật');
    }
    
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId, 
      filteredData, 
      { new: true }
    ).populate(['sender', 'receiver', 'readBy']);
    
    return updatedMessage;
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa tin nhắn
 * @param {string} messageId - ID tin nhắn
 * @param {string} userId - ID người dùng (để kiểm tra quyền)
 * @returns {Promise<Object>} Kết quả xóa
 */
exports.deleteMessage = async (messageId, userId) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Không tìm thấy tin nhắn');
    }
    
    // Kiểm tra quyền xóa (chỉ người gửi mới được xóa)
    if (message.sender.toString() !== userId) {
      throw new Error('Bạn không có quyền xóa tin nhắn này');
    }
    
    await Message.findByIdAndDelete(messageId);
    
    return { success: true, message: 'Xóa tin nhắn thành công' };
  } catch (error) {
    throw error;
  }
};

/**
 * Tìm kiếm tin nhắn
 * @param {string} chatRoomId - ID phòng chat
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng kết quả mỗi trang
 * @returns {Promise<Object>} Kết quả tìm kiếm
 */
exports.searchMessages = async (chatRoomId, searchTerm, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({
      chatRoomId,
      content: { $regex: searchTerm, $options: 'i' }
    })
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Message.countDocuments({
      chatRoomId,
      content: { $regex: searchTerm, $options: 'i' }
    });
    
    return {
      messages,
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
 * Lấy thống kê tin nhắn
 * @param {string} chatRoomId - ID phòng chat
 * @returns {Promise<Object>} Thống kê tin nhắn
 */
exports.getMessageStats = async (chatRoomId) => {
  try {
    const stats = await Message.aggregate([
      { $match: { chatRoomId: new require('mongoose').Types.ObjectId(chatRoomId) } },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          textMessages: {
            $sum: { $cond: [{ $eq: ['$messageType', 'text'] }, 1, 0] }
          },
          imageMessages: {
            $sum: { $cond: [{ $eq: ['$messageType', 'image'] }, 1, 0] }
          },
          videoMessages: {
            $sum: { $cond: [{ $eq: ['$messageType', 'video'] }, 1, 0] }
          },
          unreadMessages: {
            $sum: { $cond: [{ $eq: [{ $size: '$readBy' }, 0] }, 1, 0] }
          }
        }
      }
    ]);
    
    return stats.length > 0 ? stats[0] : {
      totalMessages: 0,
      textMessages: 0,
      imageMessages: 0,
      videoMessages: 0,
      unreadMessages: 0
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy tin nhắn chưa đọc của người dùng
 * @param {string} userId - ID người dùng
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng tin nhắn mỗi trang
 * @returns {Promise<Object>} Danh sách tin nhắn chưa đọc
 */
exports.getUnreadMessages = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({
      receiver: userId,
      readBy: { $ne: userId }
    })
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .populate('chatRoomId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Message.countDocuments({
      receiver: userId,
      readBy: { $ne: userId }
    });
    
    return {
      messages,
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
