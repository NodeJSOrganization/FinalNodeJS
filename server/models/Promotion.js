// --- START OF FILE models/Promotion.js ---

const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên chương trình khuyến mãi'],
        trim: true,
        unique: true
    },
    appliedProducts: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'Vui lòng chọn ít nhất một sản phẩm']
    }],
    type: {
        type: String,
        required: true,
        enum: ['fixed_amount', 'percent'],
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
        // ✨ ĐÃ SỬA LỖI VALIDATOR TẠI ĐÂY ✨
        validate: {
            validator: function (endDateValue) {
                let startDateValue;

                // Kiểm tra xem chúng ta đang ở ngữ cảnh "update" hay "create"
                // Nếu `this.getUpdate` là một hàm, nghĩa là đang update.
                if (typeof this.getUpdate === 'function') {
                    const updatePayload = this.getUpdate();
                    // Lấy startDate từ payload update, nếu không có thì lấy từ document hiện tại (cho trường hợp chỉ update endDate)
                    startDateValue = updatePayload.$set?.startDate || this.getQuery().startDate;
                } 
                // Nếu không, nghĩa là đang tạo mới.
                else {
                    startDateValue = this.startDate;
                }

                // Nếu không có startDate (để validator `required` xử lý), thì bỏ qua
                if (!startDateValue) {
                    return true;
                }

                // Thực hiện so sánh
                return new Date(endDateValue) >= new Date(startDateValue);
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