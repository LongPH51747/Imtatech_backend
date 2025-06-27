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

async function getChatbotConversation(question, access_token, apiKey) {
  const endpointURL = `https://plant.id/api/v3/identification/${access_token}/conversation`
  console.log("Đang lấy access token: ", access_token);
  try {
    const response = await axios({
      method: 'get',
      url: endpointURL,
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey
      },
      data: {
        question: question,
        prompt: "GIVE ANSWER ALL CAPS.",
        temperature: 0.5,
        app_name: "planta"
      }
    });

    return response.data
  } catch (error) {
    console.error("error: ", error.response?.data || error.message);
    throw error
  }
}

module.exports = { callPlantIdApi, getPlantDetailsById };
