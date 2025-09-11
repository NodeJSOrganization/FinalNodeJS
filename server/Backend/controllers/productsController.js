// controllers/productsController.js
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const cloudinary = require('../config/cloudinary');

// --- HELPER FUNCTION: Xóa file tạm của multer nếu có lỗi ---
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);

const cleanupFilesOnError = (files) => {
    const filePaths = [];
    if (files.images) files.images.forEach(f => filePaths.push(f.path));
    if (files.variant_images) files.variant_images.forEach(f => filePaths.push(f.path));
    filePaths.forEach(path => unlinkFile(path).catch(err => console.error(`Failed to delete temp file: ${path}`, err)));
};

// @desc    Tạo sản phẩm mới
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
    try {
        const { name, description, category, brand, variants } = req.body;

        // 1. Parse và kiểm tra variants
        let parsedVariants;
        try {
            parsedVariants = JSON.parse(variants);
        } catch (e) {
            return res.status(400).json({ success: false, msg: 'Variants không hợp lệ' });
        }

        // 2. req.files bây giờ là một MẢNG các object file khi dùng upload.any()
        const files = req.files;

        // 3. Tải tất cả ảnh lên Cloudinary
        const uploadPromises = files.map(file => cloudinary.uploader.upload(file.path, {
            folder: file.fieldname === 'images' ? 'products/general' : 'products/variants'
        }));
        const uploadResults = await Promise.all(uploadPromises);

        // Tạo một map để dễ dàng tìm kiếm ảnh đã upload bằng fieldname
        const uploadedFilesMap = {};
        files.forEach((file, index) => {
            if (!uploadedFilesMap[file.fieldname]) {
                uploadedFilesMap[file.fieldname] = [];
            }
            uploadedFilesMap[file.fieldname].push(uploadResults[index]);
        });

        // 4. Gán ảnh vào đúng chỗ
        const productImages = (uploadedFilesMap['images'] || []).map(result => ({
            url: result.secure_url,
            cloudinary_id: result.public_id
        }));

        const finalVariants = parsedVariants.map(variant => {
            const identifier = variant.imageIdentifier;
            if (identifier && uploadedFilesMap[identifier] && uploadedFilesMap[identifier][0]) {
                const result = uploadedFilesMap[identifier][0];
                variant.image = {
                    url: result.secure_url,
                    cloudinary_id: result.public_id
                };
            }
            delete variant.imageIdentifier; // Xóa key tạm sau khi đã xử lý
            return variant;
        });

        // 5. Tạo sản phẩm
        const product = await Product.create({
            name, description, category, brand,
            images: productImages,
            variants: finalVariants
        });

        res.status(201).json({ success: true, data: product });

    } catch (error) {
        if (req.files) cleanupFilesOnError(req.files);
        if (error.code === 11000) return res.status(400).json({ success: false, msg: 'Tên sản phẩm đã tồn tại' });
        console.error(error);
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Lấy tất cả sản phẩm
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.find({}).populate('category', 'name').populate('brand', 'name logo');
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Lấy chi tiết một sản phẩm
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name').populate('brand', 'name logo');
        if (!product) {
            return res.status(404).json({ success: false, msg: `Không tìm thấy sản phẩm` });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, msg: 'ID không hợp lệ' });
    }
};

// @desc    Xóa một sản phẩm
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, msg: `Không tìm thấy sản phẩm` });
        }

        const idsToDelete = [];
        product.images.forEach(img => idsToDelete.push(img.cloudinary_id));
        product.variants.forEach(variant => {
            if (variant.image && variant.image.cloudinary_id) {
                idsToDelete.push(variant.image.cloudinary_id);
            }
        });

        if (idsToDelete.length > 0) {
            await cloudinary.api.delete_resources(idsToDelete);
        }

        await product.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};


// @desc    Cập nhật một sản phẩm (Nâng cao)
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, msg: 'Không tìm thấy sản phẩm' });
        }

        const { variants, deleted_cloudinary_ids } = req.body;
        const files = req.files; // Mảng file từ upload.any()
        
        // 1. Xóa ảnh cũ trên Cloudinary
        if (deleted_cloudinary_ids) {
            const idsToDelete = deleted_cloudinary_ids.split(',').filter(id => id);
            if (idsToDelete.length > 0) {
                await cloudinary.api.delete_resources(idsToDelete);
            }
        }

        // 2. Tải ảnh mới lên Cloudinary
        const uploadPromises = files.map(file => cloudinary.uploader.upload(file.path, {
            folder: file.fieldname === 'new_main_images' ? 'products/general' : 'products/variants'
        }));
        const uploadResults = await Promise.all(uploadPromises);

        const uploadedFilesMap = {};
        files.forEach((file, index) => {
            if (!uploadedFilesMap[file.fieldname]) {
                uploadedFilesMap[file.fieldname] = [];
            }
            uploadedFilesMap[file.fieldname].push(uploadResults[index]);
        });
        
        // 3. Chuẩn bị dữ liệu cập nhật
        const updateData = { ...req.body };
        
        // 4. Cập nhật ảnh chung
        let currentMainImages = product.images.filter(img => !deleted_cloudinary_ids || !deleted_cloudinary_ids.split(',').includes(img.cloudinary_id));
        if (uploadedFilesMap['new_main_images']) {
            uploadedFilesMap['new_main_images'].forEach(result => {
                currentMainImages.push({ url: result.secure_url, cloudinary_id: result.public_id });
            });
        }
        updateData.images = currentMainImages;

        // 5. Cập nhật variants
        if (variants) {
            let parsedVariants = JSON.parse(variants);
            const finalVariants = parsedVariants.map(variant => {
                const identifier = variant.imageIdentifier;
                if (identifier && uploadedFilesMap[identifier] && uploadedFilesMap[identifier][0]) {
                    const result = uploadedFilesMap[identifier][0];
                    variant.image = { url: result.secure_url, cloudinary_id: result.public_id };
                }
                delete variant.imageIdentifier;
                return variant;
            });
            updateData.variants = finalVariants;
        }

        // 6. Cập nhật sản phẩm
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updatedProduct });

    } catch (error) {
        if (req.files) { // Dọn dẹp file tạm nếu có lỗi
            const allFiles = [...(req.files.new_main_images || []), ...(req.files.new_variant_images || [])];
            allFiles.forEach(file => require('fs').unlink(file.path, err => { if (err) console.error(err) }));
        }
        if (error.code === 11000) return res.status(400).json({ success: false, msg: 'Tên sản phẩm đã tồn tại' });
        console.error(error);
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Xóa TẤT CẢ các sản phẩm
// @route   DELETE /api/v1/products
// @access  Private/Admin
exports.deleteAllProducts = async (req, res, next) => {
    try {
        // 1. Tìm tất cả các sản phẩm để thu thập ID ảnh
        const products = await Product.find({});

        if (products.length === 0) {
            return res.status(200).json({
                success: true,
                msg: 'Không có sản phẩm nào để xóa.'
            });
        }

        // 2. Thu thập tất cả cloudinary_id từ tất cả sản phẩm
        const allCloudinaryIds = [];
        products.forEach(product => {
            // Lấy ID từ ảnh chung
            if (product.images && product.images.length > 0) {
                product.images.forEach(img => {
                    if (img.cloudinary_id) {
                        allCloudinaryIds.push(img.cloudinary_id);
                    }
                });
            }
            // Lấy ID từ ảnh của các biến thể
            if (product.variants && product.variants.length > 0) {
                product.variants.forEach(variant => {
                    if (variant.image && variant.image.cloudinary_id) {
                        allCloudinaryIds.push(variant.image.cloudinary_id);
                    }
                });
            }
        });

        // 3. Xóa tất cả ảnh trên Cloudinary (nếu có)
        // Cloudinary API cho phép xóa tối đa 100 ID mỗi lần gọi. 
        // Nếu bạn có nhiều hơn, bạn cần chia nhỏ ra.
        if (allCloudinaryIds.length > 0) {
            // Chia mảng ID thành các chunk nhỏ hơn 100
            const chunkSize = 100;
            for (let i = 0; i < allCloudinaryIds.length; i += chunkSize) {
                const chunk = allCloudinaryIds.slice(i, i + chunkSize);
                await cloudinary.api.delete_resources(chunk);
            }
        }

        // 4. Xóa tất cả sản phẩm khỏi database
        const result = await Product.deleteMany({});

        res.status(200).json({
            success: true,
            msg: `Đã xóa thành công ${result.deletedCount} sản phẩm và các ảnh liên quan.`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};
