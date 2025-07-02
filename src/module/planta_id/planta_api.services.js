// services/plant.service.js
const axios = require("axios");

async function callPlantIdApi(imageBase64, apiKey) {
  const endpointURL = "https://plant.id/api/v3/identification";
  const payload = {
    images: [imageBase64],
    similar_images: true,
  };
  return await axios.post(endpointURL, payload, {
    headers: { "Api-Key": apiKey, "Content-Type": "application/json" },
  });
}

async function getPlantDetailsById(accessToken, entityId, apiKey) {
  const endpointURL = `https://plant.id/api/v3/identification/${accessToken}`;
  console.log(`Service: Đang lấy chi tiết cho access_token: ${accessToken}`);
  console.log(`Service: Đang lấy entityId: ${entityId}`);
  const params = {
    language: "vi",
    details: [
      "common_names",
      "url",
      "description",
      "taxonomy",
      "image",
      "edible_parts",
      "watering",
    ].join(","),
  };
  return await axios.get(endpointURL, {
    params: params,
    headers: {
      "Api-Key": apiKey,
      "Content-Type": "application/json",
    },
  });
}

const createIdentification = async (imageBase64) => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("PLANT_ID_API_KEY không được tìm thấy trong file .env");
  }

  try {
    console.log("Service: Gửi ảnh để tạo phiên nhận dạng...");
    const endpointURL = "https://plant.id/api/v3/identification";
    const payload = {
      images: [imageBase64],
      similar_images: true,
    };
    return await axios.post(endpointURL, payload, {
      headers: { "Api-Key": apiKey, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(
      "Lỗi Service (createIdentification):",
      error.response ? error.response.data : error.message
    );
    throw new Error("Không thể tạo phiên nhận dạng mới từ Plant.id API.");
  }
};

async function askQuestion(question, access_token, apiKey) {
  const endpointURL = `https://plant.id/api/v3/identification/${access_token}/conversation`;
  console.log("Đang lấy access token: ", access_token);
  try {
    const response = await axios.post(endpointURL, question, {
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Lỗi Service (askQuestion):",
      error.response ? error.response.data : error.message
    );
    throw new Error("Không thể gửi câu hỏi đến Plant.id API.");
  }
}

const getConversation = async (access_token, apiKey) => {
  const apiUrl = `https://plant.id/api/v3/identification/${access_token}/conversation`;
  if (!apiKey) {
    throw new Error("PLANT_ID_API_KEY không được tìm thấy trong file .env");
  }

  try {
    console.log(`Service: Lấy lịch sử hội thoại cho ID: ${access_token}`);
    const response = await axios.get(apiUrl, {
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Lỗi Service (getConversation):",
      error.response ? error.response.data : error.message
    );
    throw new Error("Không thể lấy lịch sử hội thoại từ Plant.id API.");
  }
};

module.exports = {
  callPlantIdApi,
  getPlantDetailsById,
  askQuestion,
  getConversation,
  createIdentification,
};
