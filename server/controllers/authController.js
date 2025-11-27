// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    // --- START: CẬP NHẬT ---
    // Lấy thêm phoneNumber và address từ req.body
    const { fullName, email, phoneNumber, password, address } = req.body;
    // --- END: CẬP NHẬT ---

    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, msg: "Email đã được sử dụng" });
    }

    // --- START: CẬP NHẬT ---
    // Thêm các trường mới vào khi tạo User
    user = new User({ fullName, email, phoneNumber, password, address });
    // --- END: CẬP NHẬT ---

    // const salt = await bcrypt.genSalt(10);
    // user.password = await bcrypt.hash(password, salt);
    const verificationToken = user.getEmailVerificationToken();
    await user.save();
    const verificationUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/verifyemail/${verificationToken}`;
    const message = `
            <h1>Xác thực tài khoản của bạn</h1>
            <p>Cảm ơn bạn đã đăng ký. Vui lòng nhấp vào đường link bên dưới để hoàn tất việc đăng ký:</p>
            <a href="${verificationUrl}" clicktracking=off>${verificationUrl}</a>
            <p>Đường link này sẽ hết hạn sau 10 phút.</p>
        `;
    await sendEmail({
      email: user.email,
      subject: "Xác thực tài khoản",
      message,
    });
    res.status(200).json({
      success: true,
      msg: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
    });
  } catch (error) {
    // Cung cấp thông tin lỗi validation rõ ràng hơn cho frontend
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, msg: messages.join(", ") });
    }
    res
      .status(500)
      .json({ success: false, msg: "Lỗi server", error: error.message });
  }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "Vui lòng cung cấp email và mật khẩu" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, msg: "Email hoặc mật khẩu không chính xác" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Email hoặc mật khẩu không chính xác" });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        msg: "Vui lòng xác thực tài khoản qua email trước khi đăng nhập.",
      });
    }
    if (user.status === "vô hiệu hóa") {
      return res
        .status(403)
        .json({ success: false, msg: "Tài khoản của bạn đã bị vô hiệu hóa" });
    }
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   return res
    //     .status(401)
    //     .json({ success: false, msg: "Email hoặc mật khẩu không chính xác" });
    // }
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, msg: "Lỗi server", error: error.message });
  }
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  user.password = undefined;
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    data: user,
  });
};

exports.verifyEmail = async (req, res, next) => {
  try {
    // Lấy token từ URL và băm nó để so sánh với DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Tìm user có token khớp và chưa hết hạn
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }, // $gt = greater than
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "Token không hợp lệ hoặc đã hết hạn." });
    }

    // Xác thực thành công, cập nhật user
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Xác thực email thành công. Bạn có thể đăng nhập.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, msg: "Lỗi server", error: error.message });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        msg: "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được một liên kết đặt lại mật khẩu.",
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // --- START: THAY ĐỔI QUAN TRỌNG TẠI ĐÂY ---
    // URL này phải trỏ đến trang GIAO DIỆN của bạn, không phải API
    // Chúng ta sẽ truyền token như một query parameter
    // Thay 'http://localhost:5173' bằng domain frontend của bạn khi deploy
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    // --- END: THAY ĐỔI QUAN TRỌNG TẠI ĐÂY ---

    const message = `
            <h1>Yêu cầu đặt lại mật khẩu</h1>
            <p>Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Vui lòng nhấp vào đường link bên dưới để đặt lại mật khẩu:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
            <p>Đường link này sẽ hết hạn sau 10 phút.</p>
            <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
        `;

    await sendEmail({
      email: user.email,
      subject: "Yêu cầu đặt lại mật khẩu",
      message,
    });

    res.status(200).json({
      success: true,
      msg: "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được một liên kết đặt lại mật khẩu.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, msg: "Lỗi server", error: error.message });
  }
};

// @desc    Đặt lại mật khẩu mới (Bước 2: Cập nhật mật khẩu)
// @route   PUT /api/auth/resetpassword/:token
// controllers/authController.js
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res
        .status(400)
        .json({ success: false, msg: "Vui lòng cung cấp mật khẩu mới." });
    }

    const hashedToken = crypto
      .createHash("sha256") // Sửa lại thành sha256 nếu bạn dùng sha256
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "Token không hợp lệ hoặc đã hết hạn." });
    }

    // Đánh dấu các trường cần thay đổi
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Mã hóa mật khẩu mới
    // const salt = await bcrypt.genSalt(10);
    // user.password = await bcrypt.hash(user.password, salt);

    // --- THAY ĐỔI QUAN TRỌNG TẠI ĐÂY ---
    // Khi lưu, chỉ validate những trường đã được sửa đổi (password, reset tokens)
    // Mongoose sẽ bỏ qua việc kiểm tra các trường khác như address.
    await user.save({ validateModifiedOnly: true });
    // ------------------------------------

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("LỖI KHI RESET PASSWORD:", error);
    res
      .status(500)
      .json({ success: false, msg: "Lỗi server", error: error.message });
  }
};

// @desc    Đổi mật khẩu khi đã đăng nhập
// @route   PUT /api/auth/changepassword
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, msg: 'Không tìm thấy người dùng.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: 'Mật khẩu hiện tại không chính xác.' });
    }

    // const salt = await bcrypt.genSalt(10);
    // user.password = await bcrypt.hash(newPassword, salt);
    user.password = newPassword;

    await user.save({ validateModifiedOnly: true });

    user.password = undefined;
    res.status(200).json({
      success: true,
      msg: 'Đổi mật khẩu thành công.',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
  }
};