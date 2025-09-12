// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Tạo một transporter (dịch vụ sẽ gửi mail, ở đây là Gmail)
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Sử dụng dịch vụ Gmail
        auth: {
            user: process.env.EMAIL_USER, // Email của bạn
            pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng
        }
    });

    // 2. Định nghĩa các tùy chọn cho email (người nhận, tiêu đề, nội dung...)
    const mailOptions = {
        from: `Tên App Của Bạn <${process.env.EMAIL_FROM}>`, // Tên và email người gửi
        to: options.email,        // Email người nhận
        subject: options.subject, // Tiêu đề email
        html: options.message     // Nội dung email (hỗ trợ HTML)
    };

    // 3. Gửi email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;