const path = require('path')
const fs = require('fs')
const multer = require('multer')

const uploadDir = path.join(__dirname, '../public/uploads_product')

// Tao thu muc neu chua ton tai
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

// Luu vao ram de dung Sharp xu ly
const storage = multer.memoryStorage()

const upload = multer({
    storage,
    limits: { fieldSize: 5 * 1024 * 1024 }, // Gioi han cho no chi toi da 5mb
    fileFilter: ( req, file, cb ) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Chi chap nhan anh jpg, png, webp'), false)
        }
        cb(null,true)
    }
})

module.exports = upload
