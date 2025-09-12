// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Cấu hình lưu trữ file tạm
const storage = multer.diskStorage({}); // Lưu file tạm vào thư mục mặc định của hệ điều hành

// Kiểm tra định dạng file
const fileFilter = (req, file, cb) => {
    // === START: MỞ RỘNG DANH SÁCH ĐỊNH DẠNG ẢNH ===
    // Danh sách cũ: jpeg|jpg|png|gif|webp|svg|tiff|ico
    // Danh sách mới đã bao gồm thêm:
    // - bmp: Định dạng ảnh bitmap cũ
    // - heic/heif: Định dạng ảnh hiệu suất cao của Apple
    // - avif: Định dạng ảnh hiện đại, hiệu quả cao
    // - psd: File Photoshop (nếu bạn muốn cho phép)
    // - ai: File Adobe Illustrator (nếu bạn muốn cho phép)
    const filetypes = /jpeg|jpg|png|gif|webp|svg|tiff|ico|bmp|heic|heif|avif|psd|ai/;
    // ===============================================

    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype || extname) { // <-- Sửa điều kiện từ && thành || để linh hoạt hơn
        return cb(null, true);
    }

    // Cập nhật thông báo lỗi để người dùng biết các định dạng được phép
    cb(new Error("Lỗi: Định dạng file không được hỗ trợ! Chỉ chấp nhận các định dạng ảnh phổ biến."));
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Tăng giới hạn kích thước lên 10MB để phù hợp với các file chất lượng cao
});

module.exports = upload;

