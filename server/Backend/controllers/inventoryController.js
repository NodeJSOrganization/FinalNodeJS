// controllers/inventoryController.js
const Product = require('../models/Product');

// @desc    Lấy danh sách tồn kho của tất cả các biến thể sản phẩm
// @route   GET /api/v1/inventory
// @access  Private/Admin
exports.getInventory = async (req, res, next) => {
    try {
        const inventory = await Product.aggregate([
            // Tách mỗi phần tử trong mảng 'variants' thành một document riêng
            { $unwind: '$variants' },

            // Lấy thông tin từ collection 'brands'
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brand',
                    foreignField: '_id',
                    as: 'brandInfo'
                }
            },
            // Tách mảng brandInfo (thường chỉ có 1 phần tử)
            { $unwind: { path: '$brandInfo', preserveNullAndEmptyArrays: true } },

            // Định hình lại output cuối cùng
            {
                $project: {
                    _id: 0, // Bỏ trường _id của Product
                    productId: '$_id',
                    productName: '$name',
                    brandName: '$brandInfo.name',
                    variant: {
                        _id: '$variants._id',
                        color: '$variants.color',
                        performance: '$variants.performance',
                        sku: '$variants.sku',
                        quantity: '$variants.quantity',
                        sellingPrice: '$variants.sellingPrice',
                        image: '$variants.image.url'
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: inventory.length,
            data: inventory
        });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Cập nhật số lượng tồn kho cho một biến thể
// @route   PUT /api/v1/inventory/:productId/:variantId
// @access  Private/Admin
exports.updateInventory = async (req, res, next) => {
    const { productId, variantId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
        return res.status(400).json({ success: false, msg: 'Vui lòng cung cấp số lượng hợp lệ.' });
    }

    try {
        const product = await Product.findOneAndUpdate(
            { "_id": productId, "variants._id": variantId },
            {
                "$set": { "variants.$.quantity": quantity }
            },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, msg: 'Không tìm thấy sản phẩm hoặc biến thể.' });
        }

        res.status(200).json({ success: true, msg: 'Cập nhật tồn kho thành công.' });

    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};