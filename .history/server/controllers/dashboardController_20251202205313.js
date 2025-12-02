// controllers/dashboardController.js
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Lấy số liệu tổng quan (Simple Dashboard)
// @route   GET /api/v1/dashboard/stats
exports.getAnalysisData = async (req, res) => {
    try {
        const { timeframe, startDate, endDate } = req.query; 
        
        let dateFormat;
        let matchStage = { 
            currentStatus: { $in: ['delivered', 'confirmed', 'shipping', 'pending'] } 
        };

        // --- LOGIC XỬ LÝ KHOẢNG THỜI GIAN ---
        if (startDate && endDate) {
            // 1. Lọc theo ngày người dùng chọn
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Set end date về cuối ngày (23:59:59)
            const endOfDay = new Date(end);
            endOfDay.setHours(23, 59, 59, 999);

            matchStage.createdAt = {
                $gte: start,
                $lte: endOfDay
            };

            // 2. TÍNH TOÁN KHOẢNG CÁCH NGÀY ĐỂ QUYẾT ĐỊNH FORMAT
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            // Nếu khoảng cách nhỏ hơn hoặc bằng 60 ngày -> Luôn gom nhóm theo NGÀY
            if (diffDays <= 60) {
                dateFormat = "%Y-%m-%d"; 
            } else {
                // Nếu khoảng cách dài hơn -> Gom nhóm theo THÁNG cho gọn biểu đồ
                dateFormat = "%Y-%m"; 
            }

        } else {
            // NẾU KHÔNG CHỌN NGÀY -> Dùng Logic Timeframe cũ
            const today = new Date();
            let pastDate = new Date();

            switch (timeframe) {
                case 'weekly':
                    pastDate.setDate(today.getDate() - 7);
                    dateFormat = "%Y-%m-%d"; // Tuần -> Xem theo ngày
                    break;
                case 'monthly':
                    pastDate.setDate(today.getDate() - 30);
                    dateFormat = "%Y-%m-%d"; // Tháng -> Xem theo ngày
                    break;
                case 'quarterly':
                    pastDate.setDate(today.getDate() - 90);
                    dateFormat = "%Y-%m";    // Quý -> Xem theo tháng
                    break;
                case 'annually':
                default:
                    pastDate.setFullYear(today.getFullYear() - 1);
                    dateFormat = "%Y-%m";    // Năm -> Xem theo tháng
                    break;
            }
            matchStage.createdAt = { $gte: pastDate };
        }

        // --- PHẦN AGGREGATE GIỮ NGUYÊN ---
        const analysis = await Order.aggregate([
            { $match: matchStage },
            {
                $project: {
                    date: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                    revenue: "$summary.finalTotal",
                    profit: { $multiply: ["$summary.finalTotal", 0.3] } 
                }
            },
            {
                $group: {
                    _id: "$date",
                    revenue: { $sum: "$revenue" },
                    profit: { $sum: "$profit" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const formattedData = analysis.map(item => ({
            date: item._id,
            revenue: item.revenue,
            profit: item.profit
        }));

        res.status(200).json({ success: true, data: formattedData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Lỗi server' });
    }
};

// @desc    Lấy dữ liệu phân tích biểu đồ (Advanced Dashboard)
// @route   GET /api/v1/dashboard/analysis
exports.getAnalysisData = async (req, res) => {
    try {
        // 1. Nhận thêm startDate, endDate từ query
        const { timeframe, startDate, endDate } = req.query; 
        
        let dateFormat;
        
        switch(timeframe) {
            case 'weekly': dateFormat = "%Y-%m-%d"; break;
            case 'monthly': dateFormat = "%Y-%m-%d"; break; // Hoặc "%Y-%m" nếu muốn gom theo tháng
            case 'quarterly': dateFormat = "%Y-%m"; break;
            case 'annually': dateFormat = "%Y-%m"; break;
            default: dateFormat = "%Y-%m-%d";
        }

        // 2. Xây dựng bộ lọc thời gian (Match Stage)
        let matchStage = { 
            currentStatus: { $in: ['delivered', 'confirmed', 'shipping', 'pending'] } 
        };

        // NẾU người dùng chọn ngày -> Lọc theo ngày chọn
        if (startDate && endDate) {
            matchStage.createdAt = {
                $gte: new Date(startDate), // Từ đầu ngày bắt đầu
                $lte: new Date(new Date(endDate).setHours(23, 59, 59)) // Đến cuối ngày kết thúc
            };
        } 
        // NẾU KHÔNG chọn ngày -> Lấy mặc định 1 năm gần nhất
        else {
            matchStage.createdAt = { 
                $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) 
            };
        }

        const analysis = await Order.aggregate([
            { $match: matchStage },
            {
                $project: {
                    date: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                    revenue: "$summary.finalTotal",
                    profit: { $multiply: ["$summary.finalTotal", 0.3] } 
                }
            },
            {
                $group: {
                    _id: "$date",
                    revenue: { $sum: "$revenue" },
                    profit: { $sum: "$profit" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const formattedData = analysis.map(item => ({
            date: item._id,
            revenue: item.revenue,
            profit: item.profit
        }));

        res.status(200).json({ success: true, data: formattedData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Lỗi server' });
    }
};