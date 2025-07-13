// src/middleware/uploadMiddleware.js
const multer = require('multer');
const cloudinary = require('../src/config/cloudinary'); // Đảm bảo đường dẫn này đúng tới file cloudinary.js của bạn
const createError = require('http-errors'); // Để tạo lỗi HTTP
const path = require('path'); // THÊM MỚI: Import path module, cần cho path.extname

// Cấu hình Multer để lưu file trong bộ nhớ (memory storage)
// trước khi đẩy lên Cloudinary. Điều này không tạo file tạm thời trên đĩa.
const upload = multer({
    storage: multer.memoryStorage(), // Lưu file vào RAM
    limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn kích thước file 10MB
    fileFilter: (req, file, cb) => { // 'file' là tham số được Multer truyền vào tự động
        // Chỉ cho phép các định dạng ảnh phổ biến
        const filetypes = /jpeg|jpg|png|gif|webp/; // ĐÃ SỬA: Đảm bảo tên biến là 'filetypes'
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Kiểm tra phần mở rộng

        if (mimetype && extname) {
            return cb(null, true); // Chấp nhận file
        }
        // Từ chối file và trả về lỗi
        cb(new Error('Error: File upload only supports image formats (jpeg, jpg, png, gif, webp)!'));
    },
});

// Middleware để tải ảnh lên Cloudinary sau khi Multer xử lý
const uploadImageToCloudinary = async (req, res, next) => {
    // Multer đã xử lý file và đặt nó vào req.file
    if (!req.file) {
        return next(createError(400, 'No image file provided.'));
    }

    try {
        // Tải ảnh lên Cloudinary sử dụng buffer của file
        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
            {
                folder: "chat_images", // Thư mục trên Cloudinary để nhóm ảnh chat
                resource_type: "auto", // Tự động nhận diện loại file
            }
        );

        // Gắn URL và public_id của ảnh Cloudinary vào req để các middleware/route tiếp theo có thể sử dụng
        req.cloudinaryImageUrl = result.secure_url;
        req.cloudinaryPublicId = result.public_id;

        next(); // Chuyển sang middleware/route tiếp theo
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        next(createError(500, 'Failed to upload image to Cloudinary.'));
    }
};

// Export Multer middleware và Cloudinary upload middleware
module.exports = {
    upload, // Multer instance (dùng .single('image') hoặc .array('images'))
    uploadImageToCloudinary // Middleware xử lý upload lên Cloudinary
};
