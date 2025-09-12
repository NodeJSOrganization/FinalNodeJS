// models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên danh mục'],
        unique: true,
        trim: true, // Xóa khoảng trắng thừa
        maxlength: [50, 'Tên danh mục không thể dài hơn 50 ký tự']
    },
    description: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả'],
        maxlength: [500, 'Mô tả không thể dài hơn 500 ký tự']
    },
    status: {
        type: String,
        enum: ['active', 'inactive'], // Chỉ cho phép 2 trạng thái: hoạt động, không hoạt động
        default: 'active'
    },
    // Thêm trường user để biết admin nào đã tạo danh mục này
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);