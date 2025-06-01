const mongoose = require("mongoose");

const mongoURI =
  "mongodb+srv://root:123@cluster0.goxvqbr.mongodb.net/imtatech?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    await mongoose
      .connect(mongoURI, {
      // Thêm timeout để kiểm tra, mặc định của Mongoose là 30000ms (30 giây).
      // Đặt thấp hơn giúp xác định lỗi timeout nhanh hơn.
      serverSelectionTimeoutMS: 10000, // 10 giây, bạn có thể điều chỉnh
    })
      .then(() => {
        console.log("success");
      })
      .catch((error) => {
        console.log("not success" + error);
      });
  } catch (error) {
    console.log("not success" + error);
  }
};

module.exports = { connectDB };
