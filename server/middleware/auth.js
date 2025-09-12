// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware để bảo vệ các route yêu cầu đăng nhập
exports.protect = async (req, res, next) => {
    let token;

    // Kiểm tra xem token có được gửi trong header không
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } 
    // Hoặc có thể kiểm tra trong cookie
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Đảm bảo token tồn tại
    if (!token) {
        return res.status(401).json({ success: false, msg: 'Không được phép truy cập' });
    }

    try {
        // Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Lấy thông tin user từ token và gắn vào request
        // để các hàm controller sau có thể sử dụng
        req.user = await User.findById(decoded.id);

        if (!req.user) {
             return res.status(401).json({ success: false, msg: 'Người dùng không tồn tại' });
        }

        next(); // Chuyển sang middleware/controller tiếp theo
    } catch (error) {
        return res.status(401).json({ success: false, msg: 'Không được phép truy cập' });
    }
};

// Middleware để phân quyền (chỉ cho phép các role cụ thể truy cập)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                msg: `Vai trò '${req.user.role}' không được phép truy cập vào tài nguyên này` 
            });
        }
        next();
    }
};