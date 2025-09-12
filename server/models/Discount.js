// models/Discount.js
const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Vui lòng nhập mã giảm giá'],
        unique: true,
        trim: true,
        uppercase: true // Tự động chuyển mã thành chữ hoa
    },
    description: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả']
    },
    type: {
        type: String,
        required: true,
        enum: ['percent', 'fixed_amount'], // Giảm theo % hoặc giảm số tiền cố định
        default: 'fixed_amount'
    },
    value: {
        type: Number,
        required: [true, 'Vui lòng nhập giá trị giảm giá']
    },
    quantity: {
        type: Number,
        required: [true, 'Vui lòng nhập số lượng mã']
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Discount', DiscountSchema);