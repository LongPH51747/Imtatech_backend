var express = require("express");
var router = express.Router();

const chatController = require("./chat.controller");
const authMiddleware = require("../../../middleware/authMiddleware");

// Tất cả route chat đều cần xác thực
router.use(authMiddleware);

// ===== QUẢN LÝ PHÒNG CHAT =====

router.post("/find-or-create", chatController.findOrCreateChat);

/**
 * Tạo phòng chat mới
 * POST /api/chat/rooms
 */
router.post("/rooms", chatController.createChatRoom);

/**
 * Lấy tất cả phòng chat của người dùng
 * GET /api/chat/rooms
 */
router.get("/rooms", chatController.getChatRooms);

/**
 * Lấy thông tin phòng chat cụ thể
 * GET /api/chat/rooms/:chatRoomId
 */
router.get("/rooms/:chatRoomId", chatController.getChatRoom);

/**
 * Xóa phòng chat
 * DELETE /api/chat/rooms/:chatRoomId
 */
router.delete("/rooms/:chatRoomId", chatController.deleteChatRoom);

// ===== QUẢN LÝ TIN NHẮN =====

/**
 * Lấy tin nhắn trong phòng chat
 * GET /api/chat/rooms/:chatRoomId/messages
 */
router.get("/rooms/:chatRoomId/messages", chatController.getChatMessages);

/**
 * Gửi tin nhắn
 * POST /api/chat/messages
 */
router.post("/messages", chatController.sendMessage);

/**
 * Đánh dấu tin nhắn đã đọc
 * PUT /api/chat/rooms/:chatRoomId/read
 */
router.put("/rooms/:chatRoomId/read", chatController.markAsRead);

// ===== TÍNH NĂNG BỔ SUNG =====

/**
 * Lấy số lượng tin nhắn chưa đọc
 * GET /api/chat/unread-count
 */
router.get("/unread-count", chatController.getUnreadCount);

/**
 * Tìm kiếm phòng chat
 * GET /api/chat/search
 */
router.get("/search", chatController.searchChatRooms);

/**
 * Lấy thống kê chat
 * GET /api/chat/stats
 */
router.get("/stats", chatController.getChatStats);

/**
 * Lấy tin nhắn cuối cùng của mỗi phòng chat
 * GET /api/chat/last-messages
 */
router.get("/last-messages", chatController.getLastMessages);

// ===== ROUTE CHO ADMIN =====

/**
 * Lấy phòng chat theo ID người dùng (cho admin)
 * GET /api/chat/rooms/user/:userId
 */
router.get("/rooms/user/:userId", chatController.getChatRoomByUserId);

/**
 * Lấy tất cả phòng chat (cho admin)
 * GET /api/chat/admin/rooms
 */
router.get("/admin/rooms", chatController.getAllChatRooms);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatRoom:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60f7c0b8e1b1c8a1b8e1b1c8"
 *         user:
 *           $ref: '#/components/schemas/User'
 *         admin:
 *           $ref: '#/components/schemas/User'
 *         lastMessage:
 *           $ref: '#/components/schemas/Message'
 *         lastMessageAt:
 *           type: string
 *           format: date-time
 *         lastMessageContent:
 *           type: string
 *         unreadCountUser:
 *           type: number
 *         unreadCountAdmin:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60f7c0b8e1b1c8a1b8e1b1c8"
 *         chatRoomId:
 *           type: string
 *         sender:
 *           $ref: '#/components/schemas/User'
 *         receiver:
 *           $ref: '#/components/schemas/User'
 *         content:
 *           type: string
 *         messageType:
 *           type: string
 *           enum: [text, image, video]
 *         mediaUrl:
 *           type: string
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
 * /api/chat/rooms:
 *   post:
 *     summary: Tạo phòng chat mới
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               adminId:
 *                 type: string
 *             required:
 *               - userId
 *               - adminId
 *     responses:
 *       201:
 *         description: Tạo phòng chat thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 chatRoom:
 *                   $ref: '#/components/schemas/ChatRoom'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *
 *   get:
 *     summary: Lấy tất cả phòng chat của người dùng
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Vai trò của người dùng
 *     responses:
 *       200:
 *         description: Lấy danh sách phòng chat thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 chatRooms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatRoom'
 */

/**
 * @swagger
 * /api/chat/rooms/{chatRoomId}:
 *   get:
 *     summary: Lấy thông tin phòng chat cụ thể
 *     tags: [Chat]
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
 *         description: Lấy thông tin phòng chat thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 chatRoom:
 *                   $ref: '#/components/schemas/ChatRoom'
 *
 *   delete:
 *     summary: Xóa phòng chat
 *     tags: [Chat]
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
 *         description: Xóa phòng chat thành công
 */

/**
 * @swagger
 * /api/chat/rooms/{chatRoomId}/messages:
 *   get:
 *     summary: Lấy tin nhắn trong phòng chat
 *     tags: [Chat]
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
 * /api/chat/messages:
 *   post:
 *     summary: Gửi tin nhắn
 *     tags: [Chat]
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
 *         description: Gửi tin nhắn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 */

/**
 * @swagger
 * /api/chat/rooms/{chatRoomId}/read:
 *   put:
 *     summary: Đánh dấu tin nhắn đã đọc
 *     tags: [Chat]
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
 *         description: Đánh dấu đã đọc thành công
 */

/**
 * @swagger
 * /api/chat/unread-count:
 *   get:
 *     summary: Lấy số lượng tin nhắn chưa đọc
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *     responses:
 *       200:
 *         description: Lấy số tin nhắn chưa đọc thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 unreadCount:
 *                   type: integer
 */

/**
 * @swagger
 * /api/chat/search:
 *   get:
 *     summary: Tìm kiếm phòng chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *     responses:
 *       200:
 *         description: Tìm kiếm phòng chat thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 chatRooms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatRoom'
 */

/**
 * @swagger
 * /api/chat/stats:
 *   get:
 *     summary: Lấy thống kê chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *     responses:
 *       200:
 *         description: Lấy thống kê chat thành công
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
 *                     totalRooms:
 *                       type: integer
 *                     totalUnread:
 *                       type: integer
 *                     activeRooms:
 *                       type: integer
 */

/**
 * @swagger
 * /api/chat/last-messages:
 *   get:
 *     summary: Lấy tin nhắn cuối cùng của mỗi phòng chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *     responses:
 *       200:
 *         description: Lấy tin nhắn cuối cùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 lastMessages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatRoom'
 */

/**
 * @swagger
 * /api/chat/rooms/user/{userId}:
 *   get:
 *     summary: Lấy phòng chat theo ID người dùng (cho admin)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy phòng chat thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 chatRoom:
 *                   $ref: '#/components/schemas/ChatRoom'
 */

/**
 * @swagger
 * /api/chat/admin/rooms:
 *   get:
 *     summary: Lấy tất cả phòng chat (cho admin)
 *     tags: [Chat]
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
 *         description: Lấy tất cả phòng chat thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 chatRooms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatRoom'
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
