const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên chương trình khuyến mãi'],
        trim: true,
        unique: true
    },
    // Mảng chứa các ID của sản phẩm được áp dụng
    appliedProducts: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'Vui lòng chọn ít nhất một sản phẩm']
    }],
    type: {
        type: String,
        required: true,
        enum: ['fixed_amount', 'percent'], // Giảm số tiền cố định hoặc giảm theo %
        default: 'percent'
    },
    value: {
        type: Number,
        required: [true, 'Vui lòng nhập giá trị khuyến mãi'],
        min: [0, 'Giá trị khuyến mãi không thể là số âm']
    },
    startDate: {
        type: Date,
        required: [true, 'Vui lòng nhập ngày bắt đầu']
    },
    endDate: {
        type: Date,
        required: [true, 'Vui lòng nhập ngày kết thúc'],
        validate: {
            validator: function (value) {
                // Lấy toàn bộ object đang được cập nhật
                const update = this.getUpdate();

                // Xác định startDate để so sánh:
                // 1. Nếu đang cập nhật, lấy từ object update (`update.$set.startDate`).
                // 2. Nếu đang tạo mới, lấy từ document hiện tại (`this.startDate`).
                const startDateToCompare = update?.$set?.startDate || this.startDate;

                // Nếu không có startDate (để validator `required` xử lý), thì bỏ qua
                if (!startDateToCompare) return true;

                // Thực hiện so sánh chính xác
                return new Date(value) >= new Date(startDateToCompare);
            },
            message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu'
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Promotion', PromotionSchema);