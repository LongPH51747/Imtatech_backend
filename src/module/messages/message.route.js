var express = require("express");
var router = express.Router();

const messageController = require("./message.controller");
const authMiddleware = require("../../../middleware/authMiddleware");

// Tất cả route message đều cần xác thực
router.use(authMiddleware);

// ===== QUẢN LÝ TIN NHẮN CƠ BẢN =====

/**
 * Tạo tin nhắn mới
 * POST /api/messages
 */
router.post("/", messageController.createMessage);

/**
 * Lấy tin nhắn theo ID
 * GET /api/messages/:messageId
 */
router.get("/:messageId", messageController.getMessageById);

/**
 * Cập nhật tin nhắn
 * PUT /api/messages/:messageId
 */
router.put("/:messageId", messageController.updateMessage);

/**
 * Xóa tin nhắn
 * DELETE /api/messages/:messageId
 */
router.delete("/:messageId", messageController.deleteMessage);

// ===== LẤY DANH SÁCH TIN NHẮN =====

/**
 * Lấy tin nhắn trong phòng chat
 * GET /api/messages/chat-room/:chatRoomId
 */
router.get("/chat-room/:chatRoomId", messageController.getMessagesByChatRoom);

/**
 * Lấy tin nhắn theo người gửi
 * GET /api/messages/sender/:senderId
 */
router.get("/sender/:senderId", messageController.getMessagesBySender);

/**
 * Lấy tin nhắn theo người nhận
 * GET /api/messages/receiver/:receiverId
 */
router.get("/receiver/:receiverId", messageController.getMessagesByReceiver);

/**
 * Lấy tin nhắn của người dùng hiện tại
 * GET /api/messages/my-messages
 */
router.get("/my-messages", messageController.getMyMessages);

/**
 * Lấy tin nhắn theo loại
 * GET /api/messages/type/:messageType
 */
router.get("/type/:messageType", messageController.getMessagesByType);

// ===== QUẢN LÝ TRẠNG THÁI ĐỌC =====

/**
 * Đánh dấu tin nhắn đã đọc
 * PUT /api/messages/:messageId/read
 */
router.put("/:messageId/read", messageController.markMessageAsRead);

/**
 * Đánh dấu tất cả tin nhắn trong phòng chat đã đọc
 * PUT /api/messages/chat-room/:chatRoomId/read-all
 */
router.put("/chat-room/:chatRoomId/read-all", messageController.markAllMessagesAsRead);

// ===== TÌM KIẾM VÀ THỐNG KÊ =====

/**
 * Tìm kiếm tin nhắn
 * GET /api/messages/search/:chatRoomId
 */
router.get("/search/:chatRoomId", messageController.searchMessages);

/**
 * Lấy thống kê tin nhắn
 * GET /api/messages/stats/:chatRoomId
 */
router.get("/stats/:chatRoomId", messageController.getMessageStats);

/**
 * Lấy tin nhắn chưa đọc của người dùng
 * GET /api/messages/unread
 */
router.get("/unread", messageController.getUnreadMessages);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60f7c0b8e1b1c8a1b8e1b1c8"
 *         chatRoomId:
 *           type: string
 *           example: "60f7c0b8e1b1c8a1b8e1b1c8"
 *         sender:
 *           $ref: '#/components/schemas/User'
 *         receiver:
 *           $ref: '#/components/schemas/User'
 *         content:
 *           type: string
 *           example: "Xin chào! Tôi cần hỗ trợ"
 *         messageType:
 *           type: string
 *           enum: [text, image, video]
 *           example: "text"
 *         mediaUrl:
 *           type: string
 *           example: "https://example.com/image.jpg"
 *         readBy:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Tạo tin nhắn mới
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatRoomId:
 *                 type: string
 *               receiverId:
 *                 type: string
 *               content:
 *                 type: string
 *               messageType:
 *                 type: string
 *                 enum: [text, image, video]
 *                 default: text
 *               mediaUrl:
 *                 type: string
 *             required:
 *               - chatRoomId
 *               - receiverId
 *     responses:
 *       201:
 *         description: Tạo tin nhắn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Dữ liệu không hợp lệ
 */

/**
 * @swagger
 * /api/messages/{messageId}:
 *   get:
 *     summary: Lấy tin nhắn theo ID
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy tin nhắn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *
 *   put:
 *     summary: Cập nhật tin nhắn
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *             required:
 *               - content
 *     responses:
 *       200:
 *         description: Cập nhật tin nhắn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *
 *   delete:
 *     summary: Xóa tin nhắn
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa tin nhắn thành công
 */

/**
 * @swagger
 * /api/messages/chat-room/{chatRoomId}:
 *   get:
 *     summary: Lấy tin nhắn trong phòng chat
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: messageType
 *         schema:
 *           type: string
 *           enum: [text, image, video]
 *     responses:
 *       200:
 *         description: Lấy tin nhắn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */

/**
 * @swagger
 * /api/messages/sender/{senderId}:
 *   get:
 *     summary: Lấy tin nhắn theo người gửi
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: senderId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lấy tin nhắn theo người gửi thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 pagination:
 *                   type: object
 */

/**
 * @swagger
 * /api/messages/receiver/{receiverId}:
 *   get:
 *     summary: Lấy tin nhắn theo người nhận
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lấy tin nhắn theo người nhận thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 pagination:
 *                   type: object
 */

/**
 * @swagger
 * /api/messages/my-messages:
 *   get:
 *     summary: Lấy tin nhắn của người dùng hiện tại
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [sent, received, all]
 *           default: all
 *     responses:
 *       200:
 *         description: Lấy tin nhắn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 pagination:
 *                   type: object
 */

/**
 * @swagger
 * /api/messages/type/{messageType}:
 *   get:
 *     summary: Lấy tin nhắn theo loại
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [text, image, video]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lấy tin nhắn theo loại thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 pagination:
 *                   type: object
 */

/**
 * @swagger
 * /api/messages/{messageId}/read:
 *   put:
 *     summary: Đánh dấu tin nhắn đã đọc
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đánh dấu tin nhắn đã đọc thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 */

/**
 * @swagger
 * /api/messages/chat-room/{chatRoomId}/read-all:
 *   put:
 *     summary: Đánh dấu tất cả tin nhắn trong phòng chat đã đọc
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đánh dấu tất cả tin nhắn đã đọc thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 */

/**
 * @swagger
 * /api/messages/search/{chatRoomId}:
 *   get:
 *     summary: Tìm kiếm tin nhắn
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: searchTerm
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Tìm kiếm tin nhắn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 pagination:
 *                   type: object
 */

/**
 * @swagger
 * /api/messages/stats/{chatRoomId}:
 *   get:
 *     summary: Lấy thống kê tin nhắn
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy thống kê tin nhắn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalMessages:
 *                       type: integer
 *                     textMessages:
 *                       type: integer
 *                     imageMessages:
 *                       type: integer
 *                     videoMessages:
 *                       type: integer
 *                     unreadMessages:
 *                       type: integer
 */

/**
 * @swagger
 * /api/messages/unread:
 *   get:
 *     summary: Lấy tin nhắn chưa đọc của người dùng
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lấy tin nhắn chưa đọc thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 pagination:
 *                   type: object
 */
