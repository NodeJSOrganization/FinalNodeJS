// controllers/discountsController.js
const Discount = require('../models/Discount');

// @desc    Tạo mã giảm giá mới
// @route   POST /api/v1/discounts
// @access  Private/Admin
exports.createDiscount = async (req, res, next) => {
    try {
        const discount = await Discount.create(req.body);
        res.status(201).json({ success: true, data: discount });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, msg: 'Mã giảm giá đã tồn tại' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, msg: messages.join(', ') });
        }
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Lấy tất cả mã giảm giá
// @route   GET /api/v1/discounts
// @access  Public (hoặc Private/Admin tùy bạn)
exports.getDiscounts = async (req, res, next) => {
    try {
        const discounts = await Discount.find({});
        res.status(200).json({ success: true, count: discounts.length, data: discounts });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Lấy chi tiết một mã giảm giá
// @route   GET /api/v1/discounts/:id
// @access  Public
exports.getDiscount = async (req, res, next) => {
    try {
        const discount = await Discount.findById(req.params.id);
        if (!discount) {
            return res.status(404).json({ success: false, msg: `Không tìm thấy mã giảm giá` });
        }
        res.status(200).json({ success: true, data: discount });
    } catch (error) {
        res.status(400).json({ success: false, msg: 'ID không hợp lệ' });
    }
};

// @desc    Cập nhật một mã giảm giá
// @route   PUT /api/v1/discounts/:id
// @access  Private/Admin
exports.updateDiscount = async (req, res, next) => {
    try {
        const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true // <-- Dòng này rất quan trọng, nó sẽ kích hoạt validation
        });

        if (!discount) {
            return res.status(404).json({ success: false, msg: `Không tìm thấy mã giảm giá` });
        }

        res.status(200).json({ success: true, data: discount });
    } catch (error) {
        // --- SỬA LẠI KHỐI CATCH NÀY ---
        
        // 1. In toàn bộ lỗi ra terminal của backend để bạn có thể xem
        console.error("====== LỖI KHI CẬP NHẬT DISCOUNT ======");
        console.error(error);
        console.error("=======================================");
        
        // 2. Xử lý lỗi validation một cách tường minh
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, msg: messages.join(', ') });
        }
        
        // 3. Xử lý lỗi trùng mã
        if (error.code === 11000) {
            return res.status(400).json({ success: false, msg: 'Mã giảm giá đã tồn tại' });
        }

        // 4. Các lỗi khác
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
        // --- KẾT THÚC SỬA ĐỔI ---
    }
};

// @desc    Xóa một mã giảm giá
// @route   DELETE /api/v1/discounts/:id
// @access  Private/Admin
exports.deleteDiscount = async (req, res, next) => {
    try {
        const discount = await Discount.findById(req.params.id);
        if (!discount) {
            return res.status(404).json({ success: false, msg: `Không tìm thấy mã giảm giá` });
        }
        await discount.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Xóa TẤT CẢ mã giảm giá
// @route   DELETE /api/v1/discounts
// @access  Private/Admin
exports.deleteAllDiscounts = async (req, res, next) => {
    try {
        const result = await Discount.deleteMany({});
        res.status(200).json({
            success: true,
            msg: `Đã xóa thành công ${result.deletedCount} mã giảm giá.`
        });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};