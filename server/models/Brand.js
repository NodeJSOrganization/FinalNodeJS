// models/Brand.js
const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên thương hiệu'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả']
    },
    logo: {
        type: String, // Sẽ lưu URL của ảnh từ Cloudinary
        required: [true, 'Vui lòng cung cấp logo']
    },
    cloudinary_id: {
        type: String // Dùng để xóa ảnh trên Cloudinary khi cần
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Brand', BrandSchema);