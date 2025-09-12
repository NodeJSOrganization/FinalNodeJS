// controllers/brandsController.js
const Brand = require('../models/Brand');
const cloudinary = require('../config/cloudinary');

// @desc    Tạo thương hiệu mới
// @route   POST /api/v1/brands
// @access  Private/Admin
exports.createBrand = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, msg: 'Vui lòng tải lên logo' });
        }

        // Tải ảnh lên Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'brands' // Tên thư mục trên Cloudinary
        });

        const brand = await Brand.create({
            name: req.body.name,
            description: req.body.description,
            logo: result.secure_url,
            cloudinary_id: result.public_id,
            status: req.body.status
        });

        res.status(201).json({ success: true, data: brand });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, msg: 'Tên thương hiệu đã tồn tại' });
        }
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Lấy tất cả thương hiệu
// @route   GET /api/v1/brands
// @access  Public
exports.getBrands = async (req, res, next) => {
    try {
        const brands = await Brand.find({});
        res.status(200).json({ success: true, count: brands.length, data: brands });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Lấy thông tin chi tiết một thương hiệu
// @route   GET /api/v1/brands/:id
// @access  Public
exports.getBrand = async (req, res, next) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, msg: `Không tìm thấy thương hiệu với ID ${req.params.id}` });
        }
        res.status(200).json({ success: true, data: brand });
    } catch (error) {
        res.status(400).json({ success: false, msg: 'ID không hợp lệ' });
    }
};

// @desc    Cập nhật một thương hiệu
// @route   PUT /api/v1/brands/:id
// @access  Private/Admin
exports.updateBrand = async (req, res, next) => {
    try {
        let brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, msg: `Không tìm thấy thương hiệu với ID ${req.params.id}` });
        }

        let newLogoUrl = brand.logo;
        let newCloudinaryId = brand.cloudinary_id;

        // Nếu có file ảnh mới được tải lên
        if (req.file) {
            // Xóa ảnh cũ trên Cloudinary
            if (brand.cloudinary_id) {
                await cloudinary.uploader.destroy(brand.cloudinary_id);
            }

            // Tải ảnh mới lên
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'brands'
            });
            newLogoUrl = result.secure_url;
            newCloudinaryId = result.public_id;
        }

        const updateData = {
            ...req.body,
            logo: newLogoUrl,
            cloudinary_id: newCloudinaryId
        };

        const updatedBrand = await Brand.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: updatedBrand });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, msg: 'Tên thương hiệu đã tồn tại' });
        }
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Xóa một thương hiệu
// @route   DELETE /api/v1/brands/:id
// @access  Private/Admin
exports.deleteBrand = async (req, res, next) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, msg: `Không tìm thấy thương hiệu với ID ${req.params.id}` });
        }

        // Xóa ảnh trên Cloudinary
        if (brand.cloudinary_id) {
            await cloudinary.uploader.destroy(brand.cloudinary_id);
        }

        // Xóa brand trong database
        await brand.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Xóa TẤT CẢ các thương hiệu
// @route   DELETE /api/v1/brands
// @access  Private/Admin
exports.deleteAllBrands = async (req, res, next) => {
    try {
        // 1. Tìm tất cả các brand để lấy cloudinary_id
        const brands = await Brand.find({});

        if (brands.length === 0) {
            return res.status(200).json({
                success: true,
                msg: 'Không có thương hiệu nào để xóa.'
            });
        }

        // 2. Lấy ra danh sách các cloudinary_id cần xóa
        // Lọc ra những brand có cloudinary_id để tránh lỗi
        const cloudinaryIds = brands
            .map(brand => brand.cloudinary_id)
            .filter(id => id); // Lọc bỏ các giá trị null hoặc undefined

        // 3. Xóa tất cả ảnh trên Cloudinary (nếu có)
        if (cloudinaryIds.length > 0) {
            // Sử dụng API của Cloudinary để xóa nhiều ảnh cùng lúc
            await cloudinary.api.delete_resources(cloudinaryIds);
        }

        // 4. Xóa tất cả các brand khỏi database
        const result = await Brand.deleteMany({});

        res.status(200).json({
            success: true,
            msg: `Đã xóa thành công ${result.deletedCount} thương hiệu và các logo liên quan.`
        });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};