// controllers/categoriesController.js
const Category = require('../models/Category');

// @desc    Tạo một danh mục mới
// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
    try {
        // Thêm ID của admin đã đăng nhập vào req.body
        req.body.user = req.user.id;

        // Kiểm tra xem tên danh mục đã tồn tại chưa
        const existingCategory = await Category.findOne({ name: req.body.name });
        if (existingCategory) {
            return res.status(400).json({ success: false, msg: 'Tên danh mục đã tồn tại' });
        }

        const category = await Category.create(req.body);

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Lấy tất cả danh mục
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
    try {
        // Sử dụng find({}) để lấy tất cả các document trong collection
        const categories = await Category.find({});
        
        res.status(200).json({
            success: true,
            count: categories.length, // Trả về số lượng danh mục
            data: categories
        });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Cập nhật một danh mục
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
    try {
        // Tìm danh mục theo ID từ URL
        let category = await Category.findById(req.params.id);

        // Nếu không tìm thấy danh mục
        if (!category) {
            return res.status(404).json({ success: false, msg: `Không tìm thấy danh mục với ID ${req.params.id}` });
        }
        
        // Cập nhật danh mục với dữ liệu mới từ req.body
        // findByIdAndUpdate sẽ tìm theo ID và cập nhật, trả về document mới sau khi cập nhật (do có new: true)
        category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Trả về document đã được cập nhật
            runValidators: true // Chạy lại các trình xác thực (validation) trong Schema
        });

        res.status(200).json({
            success: true,
            data: category
        });

    } catch (error) {
        // Xử lý lỗi trùng tên danh mục
        if (error.code === 11000) {
             return res.status(400).json({ success: false, msg: 'Tên danh mục đã tồn tại' });
        }
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Xóa một danh mục
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
    try {
        // Tìm danh mục theo ID từ URL
        const category = await Category.findById(req.params.id);

        // Nếu không tìm thấy danh mục
        if (!category) {
            return res.status(404).json({ success: false, msg: `Không tìm thấy danh mục với ID ${req.params.id}` });
        }
        
        // Thực hiện xóa
        await category.deleteOne(); // Hoặc Category.findByIdAndDelete(req.params.id);

        // Trả về response thành công
        // Theo chuẩn REST, response cho DELETE thành công thường không cần body, chỉ cần status 204
        // Nhưng để dễ hiểu, chúng ta sẽ trả về một JSON đơn giản.
        res.status(200).json({
            success: true,
            data: {} // Dữ liệu trống báo hiệu đã xóa thành công
        });

    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Lấy thông tin chi tiết một danh mục
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = async (req, res, next) => {
    try {
        // Tìm danh mục theo ID từ URL
        const category = await Category.findById(req.params.id);

        // Nếu không tìm thấy danh mục
        if (!category) {
            return res.status(404).json({ success: false, msg: `Không tìm thấy danh mục với ID ${req.params.id}` });
        }

        res.status(200).json({
            success: true,
            data: category
        });

    } catch (error) {
        // Xử lý trường hợp ID không hợp lệ (ví dụ: không phải định dạng ObjectId)
        res.status(400).json({ success: false, msg: 'ID không hợp lệ' });
    }
};

// @desc    Xóa TẤT CẢ danh mục
// @route   DELETE /api/v1/categories
// @access  Private/Admin
exports.deleteAllCategories = async (req, res, next) => {
    try {
        // Sử dụng deleteMany({}) để xóa tất cả các document
        const result = await Category.deleteMany({});
        
        res.status(200).json({
            success: true,
            msg: `Đã xóa thành công ${result.deletedCount} danh mục.`
        });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};