// controllers/plant.controller.js
const plantService = require("./planta_api.services"); // Giữ nguyên tên file service của bạn

const handleCreateIdentification = async (req, res) => {
  if (!req.file) {
    return res
      .status(200)
      .json({
        message:
          "Tôi đang không biết bạn hỏi về loài cây gì?\nVui lòng gửi cho tôi 1 ảnh về loài cây mà bạn đang cần thắc mắc!",
      });
  }
  try {
    const imageBase64 = req.file.buffer.toString("base64");
    console.log("Controller: Nhận yêu cầu tạo phiên nhận dạng...");
    const result = await plantService.createIdentification(imageBase64);
    const identificationData = result.data;
    const suggestions = result.data.result.classification.suggestions;
    console.log("identificationData", identificationData);
    
    // 1. Kiểm tra xem có gợi ý nào không
    if (!suggestions || suggestions.length === 0) {
      return res.status(404).json({
        // Nên dùng 404 Not Found
        message: "Không nhận dạng được cây nào từ hình ảnh.",
      });
    }

    // 2. Lấy gợi ý có xác suất cao nhất
    const topSuggestion = suggestions[0];
    const probability = topSuggestion.probability;

    // 3. Đặt ngưỡng tin cậy (ví dụ: 50%)
    const CONFIDENCE_THRESHOLD = 0.5;

    console.log(
      `Gợi ý hàng đầu: ${topSuggestion.name} với xác suất: ${probability}`
    );

    // 4. Kiểm tra xác suất so với ngưỡng
    if (probability < CONFIDENCE_THRESHOLD) {
      return res.status(200).json({
        // Dùng 200 OK nhưng báo không chắc chắn
        message: `Chúng tôi không chắc chắn đây là cây gì. Kết quả có khả năng cao nhất là '${
          topSuggestion.name
        }' nhưng độ chính xác quá thấp: ${probability * 100}%.`,
        // Bạn có thể chọn không trả về identificationData nếu không muốn gây nhiễu
        identificationData: identificationData,
      });
    }

    // Nếu xác suất đủ cao, trả về kết quả thành công
    res.status(201).json(identificationData);
  } catch (error) {
    console.error("Lỗi khi nhận dạng cây:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * Xử lý yêu cầu gửi câu hỏi đến chatbot.
 */
const handleAskQuestion = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ URL
    const question = req.body;
    const apiKey = process.env.API_KEY;
    console.log(`Controller: Nhận yêu cầu hỏi đáp cho ID: ${id}`);
    const result = await plantService.askQuestion(question, id, apiKey);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Xử lý yêu cầu lấy lịch sử hội thoại.
 */
const handleGetConversation = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ URL
    const apiKey = process.env.API_KEY;
    console.log(`Controller: Nhận yêu cầu lấy lịch sử cho ID: ${id}`);
    const result = await plantService.getConversation(id, apiKey);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  handleCreateIdentification,
  handleAskQuestion,
  handleGetConversation,
};
