// controllers/plant.controller.js
const plantService = require("./planta_api.services"); // Giữ nguyên tên file service của bạn

async function handleIdentifyPlant(req, res) {
  // === SỬA LẠI TÊN BIẾN CHO ĐÚNG ===
  const apiKey = "a3XIIqjSTObAIkBRw9zkoATEVJocudufESKTcaLVBbwXvWEuAY";

  if (!apiKey) {
    return res.status(500).json({
      error:
        "API Key chưa được cấu hình hoặc sai tên trong file .env. Tên đúng là API_KEY",
    });
  }
  if (!req.file) {
    return res
      .status(400)
      .json({ error: "Không có file ảnh nào được tải lên." });
  }

  try {
    const imageBase64 = req.file.buffer.toString("base64");
    const identificationResponse = await plantService.callPlantIdApi(
      imageBase64,
      apiKey
    );
    const identificationData = identificationResponse.data;
    const suggestions =
      identificationResponse.data.result.classification.suggestions;
    if (!suggestions || suggestions.length === 0) {
      return res.status(200).json({
        message:
          "Nhận dạng thành công nhưng không tìm thấy loài cây nào phù hợp.",
      });
    }

    const topSuggestion = suggestions[0];
    const entityId = topSuggestion.details.entity_id;
    const accessToken = identificationData.access_token;
    // Gọi service lấy chi tiết chỉ với entityId và apiKey
    const detailsResponse = await plantService.getPlantDetailsById(
      accessToken,
      entityId,
      apiKey
    );

    const finalResult = {
      identification: topSuggestion,
      details: detailsResponse.data,
    };

    res.status(200).json(finalResult);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    const details = error.response
      ? error.response.data.error || error.response.data
      : { message: error.message };
    res.status(status).json({
      error: "Có lỗi xảy ra trong quá trình xử lý.",
      details: details,
    });
  }
}

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
        identificationData: null,
      });
    }

    // Nếu xác suất đủ cao, trả về kết quả thành công
    res.status(201).json(identificationData);
  } catch (error) {
    console.error("Lỗi khi nhận dạng cây:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const handleAskChatbot = async (req, res) => {
  if (!req.file) {
    return res
      .status(200)
      .json({
        message:
          "Tôi đang không biết bạn hỏi về loài cây gì?\nVui lòng gửi cho tôi 1 ảnh về loài cây mà bạn đang cần thắc mắc!",
      });
  }
  try {
    const apiKey = process.env.API_KEY;
    const question = req.body;
    const imageBase64 = req.file.buffer.toString("base64");
    console.log("Controller: Nhận yêu cầu tạo phiên nhận dạng...");
    const result = await plantService.createIdentification(imageBase64);
    const identificationData = result.data;
    const suggestions = result.data.result.classification.suggestions;

    // 1. Kiểm tra xem có gợi ý nào không
    if (!suggestions || suggestions.length === 0) {
      return res.status(404).json({
        // Nên dùng 404 Not Found
        message: "Không nhận dạng được cây nào từ hình ảnh.",
      });
    }
    const topSuggestion = suggestions[0];
    const probability = topSuggestion.probability;

    // 3. Đặt ngưỡng tin cậy (ví dụ: 50%)
    const CONFIDENCE_THRESHOLD = 0.5;

    console.log(
      `Gợi ý hàng đầu: ${topSuggestion.name} với xác suất: ${probability}`
    );

    // 4. Kiểm tra xác suất so với ngưỡng
    const entityId = topSuggestion.details.entity_id;
    const accessToken = identificationData.access_token;
    console.log("Lấy accessToken: ", accessToken);

    const askChatbot = await plantService.askQuestion(
      question,
      accessToken,
      apiKey
    );
    const resultFinalData = {
      access_token: accessToken,
      indentification: topSuggestion,
      answers: askChatbot,
    };
    if (probability < CONFIDENCE_THRESHOLD) {
      return res.status(200).json({
        // Dùng 200 OK nhưng báo không chắc chắn
        message: `Chúng tôi không chắc chắn đây là cây gì. Kết quả có khả năng cao nhất là '${
          topSuggestion.name
        }' nhưng độ chính xác quá thấp: ${probability * 100}%.`,
        // Bạn có thể chọn không trả về identificationData nếu không muốn gây nhiễu
        identificationData: resultFinalData,
      });
    }
    // Trả về mã 201 Created khi tạo tài nguyên thành công
    res.status(201).json(resultFinalData);
  } catch (error) {
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
  handleIdentifyPlant,
  handleCreateIdentification,
  handleAskQuestion,
  handleGetConversation,
  handleAskChatbot,
};
