// models/User.js
const mongoose = require('mongoose');
const crypto = require('crypto');
// const { type } = require('os'); // Dòng này có thể không cần thiết, có thể xóa

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Vui lòng nhập họ và tên'],
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Vui lòng nhập một địa chỉ email hợp lệ'
        ]
    },
    phoneNumber: {
        type: String,
        // Bỏ required để admin có thể tạo user mà không cần SĐT
        // required: [true, 'Vui lòng nhập số điện thoại'], 
    },
    // ===== THÊM MỚI 2 TRƯỜNG DƯỚI ĐÂY =====
    gender: {
        type: String,
        enum: ['Nam', 'Nữ', 'Khác']
    },
    avatar: {
        url: { type: String },
        cloudinary_id: { type: String }
    },
    // =====================================
    address: {
        province: { type: String },
        district: { type: String },
        ward: { type: String },
        streetAddress: { type: String }
    },
    addresses: [
        {
            fullName: { type: String },
            phoneNumber: { type: String },
            province: { type: String },
            district: { type: String },
            ward: { type: String },
            streetAddress: { type: String },
            isDefault: { type: Boolean, default: false },
        },
    ],
    dateOfBirth: {
        type: String, // lưu dạng "YYYY-MM-DD"
    },
    password: {
        type: String,
        required: [true, 'Vui lòng nhập mật khẩu'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    status: {
        type: String,
        enum: ['hoạt động', 'vô hiệu hóa'],
        default: 'hoạt động'
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

}, {
    timestamps: true
});

// ... (giữ nguyên các methods getEmailVerificationToken và getResetPasswordToken)

UserSchema.methods.getEmailVerificationToken = function () {
    const verificationToken = crypto.randomBytes(20).toString('hex');
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    this.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
    return verificationToken;
}

UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
}

module.exports = mongoose.model('User', UserSchema);