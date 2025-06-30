const User = require("./user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "imtatech_secret"; // (nên dùng biến môi trường .env thực tế)

exports.register = async ({ name, email, password }) => {
  // Validate dữ liệu đầu vào
  if (!name || !email || !password) {
    throw new Error("Vui lòng điền đầy đủ các trường");
  }
  if (password.length < 6) {
    throw new Error("Mật khẩu tối thiểu 6 ký tự");
  }
  // Kiểm tra định dạng email
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    throw new Error("Email không hợp lệ");
  }
  // Kiểm tra tên có hợp lệ (tối đa 50 ký tự, không chứa ký tự đặc biệt không hợp lệ)
  if (name.length > 50) {
    throw new Error("Tên quá dài");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("Email đã tồn tại");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  return user;
};

exports.login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Vui lòng nhập đầy đủ email và password");
  }
  // Kiểm tra định dạng email
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email.trim().toLowerCase())) {
    throw new Error("Email không hợp lệ");
  }
  email = email.trim().toLowerCase();

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Email không tồn tại");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Sai mật khẩu");
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
  return { token, user };
};

exports.loginAdmin = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Vui lòng nhập đầy đủ email và password");
  }
  // Kiểm tra định dạng email
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email.trim().toLowerCase())) {
    throw new Error("Email không hợp lệ");
  }
  email = email.trim().toLowerCase();

  const user = await User.findOne({ email });
  if (!user || user.role !== "admin") {
    throw new Error("Tài khoản không phải admin");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Sai mật khẩu");
  }
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
  return { token, user };
};

exports.getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("Không tìm thấy người dùng");
  return user;
};

exports.updateProfile = async (userId, data) => {
  const user = await User.findByIdAndUpdate(userId, data, { new: true }).select(
    "-password"
  );
  if (!user) throw new Error("Không tìm thấy người dùng để cập nhật");
  return user;
};

exports.deleteProfile = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new Error("Không tìm thấy người dùng để xóa");
  return user;
};

exports.getAllUser = async (next) => {
  try {
    return await User.find()
  } catch (error) {
    error.statusCode = 500;
    throw error;
    next(error);
  }
};
