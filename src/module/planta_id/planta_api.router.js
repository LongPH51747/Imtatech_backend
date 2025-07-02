// routes/api.router.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const plantController = require("./planta_api.contronller");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// URL chỉ là '/identify'
router.post(
  "/identify",
  upload.single("plantImage"),
  plantController.handleIdentifyPlant
);
router.post(
  "/identification",
  upload.single("plantImage"),
  plantController.handleCreateIdentification
);
router.post(
  "/identification/ask",
  upload.single("plantImage"),
  plantController.handleAskChatbot
);

// 2. Route để GỬI CÂU HỎI vào một cuộc hội thoại đã có
// Endpoint: POST /api/plant/conversation/:id
router.post("/conversation/ask/:id", plantController.handleAskQuestion);

// 3. Route để LẤY LỊCH SỬ của một cuộc hội thoại đã có
// Endpoint: GET /api/plant/conversation/:id
router.get("/conversation/get/:id", plantController.handleGetConversation);

module.exports = router;

/**
 * @swagger
 * tags:
 *   - name: Plant
 *     description: api AI plant.id
 */

/**
 * @swagger
 * /api/plant/identification:
 *   post:
 *     summary: Nhận diện cây từ ảnh
 *     tags: [Plant]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               plantImage:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh cây cần nhận diện
 *     responses:
 *       200:
 *         description: Nhận diện thành công, trả về thông tin cây
 *       400:
 *         description: Dữ liệu ảnh không hợp lệ
 *       500:
 *         description: Lỗi server hoặc từ API plant.id
 */

/**
 * @swagger
 * /api/plant/identification/ask:
 *   post:
 *     summary: Nhận diện cây từ ảnh và trả lời câu hỏi
 *     tags: [Plant]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               plantImage:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh cây cần nhận diện
 *               question:
 *                 type: string
 *                 description: câu hỏi cho chat bot
 *     responses:
 *       200:
 *         description: Nhận diện thành công, trả về thông tin cây
 *       400:
 *         description: Dữ liệu ảnh không hợp lệ
 *       500:
 *         description: Lỗi server hoặc từ API plant.id
 */

/**
 * @swagger
 * /api/plant/conversation/ask/{id}:
 *   post:
 *     summary: Gửi câu hỏi cho chatbot dựa trên access token của cây đã nhận diện
 *     tags: [Plant]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã định danh cuộc nhận diện (access token)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: Câu hỏi bạn muốn hỏi chatbot
 *                 example: "Is this plant edible?"
 *     responses:
 *       200:
 *         description: Trả lời thành công
 *       400:
 *         description: Câu hỏi không hợp lệ
 *       500:
 *         description: Lỗi server hoặc từ API plant.id
 */

/**
 * @swagger
 * /api/plant/conversation/get/{id}:
 *   get:
 *     summary: Lấy toàn bộ lịch sử hỏi đáp với chatbot theo access token của cây
 *     tags: [Plant]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã định danh cuộc nhận diện (access token)
 *     responses:
 *       200:
 *         description: Lấy lịch sử thành công
 *       404:
 *         description: Không tìm thấy cuộc hội thoại
 *       500:
 *         description: Lỗi server hoặc API plant.id
 */
