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

async function getChatbotConversation(req, res) {
  try {
    const apikey = process.env.API_KEY;
    const { question } = req.body;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "API Key chưa được cấu hình hoặc sai tên trong file .env. Tên đúng là API_KEY",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to get chatbot" });
  }
}

module.exports = { handleIdentifyPlant };
