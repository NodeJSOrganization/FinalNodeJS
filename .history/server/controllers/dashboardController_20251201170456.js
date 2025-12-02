// controllers/dashboardController.js
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Lấy số liệu tổng quan (Simple Dashboard)
// @route   GET /api/v1/dashboard/stats
exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // 1. Các số liệu cơ bản (Dùng Promise.all để chạy song song cho nhanh)
        const [totalUsers, newUsersThisMonth, totalOrders, totalRevenueData] = await Promise.all([
            User.countDocuments({}),
            User.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Order.countDocuments({}),
            Order.aggregate([
                { $match: { currentStatus: { $ne: 'cancelled' } } }, // Chỉ tính đơn không bị hủy
                { $group: { _id: null, total: { $sum: "$summary.finalTotal" } } }
            ])
        ]);

        const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].total : 0;

        // 2. Top 5 sản phẩm bán chạy (Dựa trên số lượng bán trong Order)
        const bestSellingProducts = await Order.aggregate([
            { $match: { currentStatus: { $ne: 'cancelled' } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product", // Group theo ID sản phẩm gốc
                    name: { $first: "$items.variant.name" },
                    image: { $first: "$items.variant.image" },
                    variantName: { $first: "$items.variant.variantName" },
                    sold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.quantity", "$items.variant.price"] } }
                }
            },
            { $sort: { sold: -1 } },
            { $limit: 5 },
            // Lookup để lấy danh mục (Category)
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $lookup: {
                    from: "categories",
                    localField: "productInfo.category",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            { $unwind: "$categoryInfo" },
            {
                $project: {
                    name: 1,
                    image: 1,
                    sold: 1,
                    revenue: 1,
                    category: "$categoryInfo.name"
                }
            }
        ]);

        // 3. Tỷ lệ doanh thu theo danh mục
        const categorySales = await Order.aggregate([
            { $match: { currentStatus: { $ne: 'cancelled' } } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $lookup: {
                    from: "categories",
                    localField: "product.category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            {
                $group: {
                    _id: "$category.name",
                    totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.variant.price"] } }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalOrders,
                totalRevenue,
                newUsersThisMonth,
                bestSellingProducts,
                categorySales: {
                    labels: categorySales.map(item => item._id),
                    data: categorySales.map(item => item.totalRevenue)
                }
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Lỗi server' });
    }
};

// @desc    Lấy dữ liệu phân tích biểu đồ (Advanced Dashboard)
// @route   GET /api/v1/dashboard/analysis
'pending'