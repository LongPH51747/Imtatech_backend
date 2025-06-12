const mongoose = require("mongoose");

const mongoURI =
  'mongodb+srv://nguyenphuongnamintern:fLVBj9UXds1ERc1J@cluster0.tkrkjv6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  // "mongodb+srv://root:123@cluster0.goxvqbr.mongodb.net/imtatech?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    await mongoose
      .connect(mongoURI, {
      // Thêm timeout để kiểm tra, mặc định của Mongoose là 30000ms (30 giây).
      // Đặt thấp hơn giúp xác định lỗi timeout nhanh hơn.
      serverSelectionTimeoutMS: 10000, // 10 giây, bạn có thể điều chỉnh
    })
      .then(() => {
        console.log("✅ Kết nối MongoDB thành công");
      })
      .catch((error) => {
        console.log("❌ Lỗi kết nối DB" + error);
      });
  } catch (error) {
    console.log("❌ Lỗi kết nối DB" + error);
  }
};

module.exports = { connectDB };


//Địa chỉ IP : 58.187.50.111 
// Tên người dùng:  nguyenphuongnamintern
// Mật khẩu:  fLVBj9UXds1ERc1J

