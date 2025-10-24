const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Tạo một "transporter" - đối tượng có khả năng gửi email
  // Chúng ta sẽ dùng Gmail làm ví dụ. Trong thực tế, bạn nên dùng các dịch vụ
  // chuyên nghiệp như SendGrid, Mailgun, Mailtrap...
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // Ví dụ: 'smtp.gmail.com'
    port: process.env.SMTP_PORT, // Ví dụ: 465 (SSL) hoặc 587 (TLS)
    secure: true, // true cho port 465, false cho các port khác
    auth: {
      user: process.env.SMTP_EMAIL, // Email của bạn
      pass: process.env.SMTP_PASSWORD, // Mật khẩu ứng dụng của email
    },
  });

  // 2. Định nghĩa các tùy chọn cho email
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // Tên người gửi hiển thị
    to: options.to, // Email người nhận
    subject: options.subject, // Tiêu đề email
    html: options.html, // Nội dung email (dưới dạng HTML)
    // text: options.text // Bạn cũng có thể gửi dạng text thuần
  };

  // 3. Gửi email
  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;
