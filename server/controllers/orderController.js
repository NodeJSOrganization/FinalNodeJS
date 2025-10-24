const Order = require("../models/Order");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmailWhenCreateOrder");

const currency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v
  );

// @desc    Lấy tất cả đơn hàng (chỉ cho Admin)
// @route   GET /api/v1/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    // Tìm tất cả các document trong collection `Order`
    const orders = await Order.find({})
      .populate("user", "fullName email") // Lấy kèm thông tin cơ bản của người dùng
      .sort({ createdAt: -1 }); // Sắp xếp theo ngày tạo mới nhất lên đầu

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    // Bắt lỗi nếu có sự cố xảy ra
    console.error("Lỗi khi lấy tất cả đơn hàng:", error);
    res.status(500).json({ success: false, msg: "Lỗi Server" });
  }
};
// @desc    Tạo đơn hàng mới (xử lý cả khách và người dùng đã đăng nhập)
// @route   POST /api/v1/orders
// @access  Public
exports.createOrder = async (req, res) => {
  // 1. Lấy dữ liệu từ frontend
  const {
    orderItems,
    customerInfo,
    shippingInfo,
    summary,
    paymentMethod,
    selectedVoucher,
  } = req.body;

  // Lấy user từ middleware `protectOptional` nếu họ đã đăng nhập
  const loggedInUser = req.user;
  let userId = loggedInUser ? loggedInUser._id : null;
  let newAccountPassword = null; // Biến để lưu mật khẩu tạm thời

  try {
    // --- BƯỚC 2: XỬ LÝ TÀI KHOẢN NGƯỜI DÙNG ---
    // Logic tự động tạo tài khoản hoặc liên kết nếu là khách
    if (!loggedInUser) {
      const existingUser = await User.findOne({ email: customerInfo.email });

      if (existingUser) {
        // Nếu khách hàng dùng email đã tồn tại, gán đơn hàng cho họ
        userId = existingUser._id;
      } else {
        // Nếu là email mới, tự động tạo tài khoản mới
        const randomPassword = crypto.randomBytes(6).toString("hex"); // Tạo mật khẩu ngẫu nhiên
        const newUser = await User.create({
          fullName: customerInfo.name,
          email: customerInfo.email,
          phoneNumber: customerInfo.phone,
          password: randomPassword, // QUAN TRỌNG: User model của bạn cần có middleware pre-save để HASH mật khẩu này
        });
        userId = newUser._id;

        // Gửi email chào mừng và thông báo mật khẩu tạm thời
        // try {
        //     await sendEmail({
        //         to: newUser.email,
        //         subject: 'Chào mừng bạn! Tài khoản của bạn đã được tạo.',
        //         html: `<h3>Chào ${newUser.fullName},</h3>
        //                <p>Một tài khoản đã được tự động tạo cho bạn tại trang web của chúng tôi.</p>
        //                <p>Bạn có thể đăng nhập bằng email này và mật khẩu tạm thời: <b>${randomPassword}</b></p>
        //                <p>Chúng tôi khuyên bạn nên đổi mật khẩu sau khi đăng nhập lần đầu tiên.</p>`
        //     });
        // } catch (emailError) {
        //     console.error("Lỗi khi gửi email tạo tài khoản:", emailError);
        //     // Không chặn quy trình đặt hàng nếu chỉ lỗi gửi mail
        // }
      }
    }

    // --- BƯỚC 3: CẬP NHẬT TỒN KHO ---
    const stockUpdatePromises = orderItems.map(async (item) => {
      const product = await Product.findById(item.product);
      const variant = product.variants.id(item.variant._id);
      if (variant && variant.quantity >= item.quantity) {
        variant.quantity -= item.quantity;
      } else {
        // Nếu tồn kho không đủ, ném lỗi để dừng toàn bộ giao dịch
        throw new Error(
          `Sản phẩm "${variant.name} - ${variant.variantName}" không đủ số lượng tồn kho.`
        );
      }
      return product.save();
    });

    // Chạy tất cả các promise cập nhật tồn kho
    await Promise.all(stockUpdatePromises);

    // --- BƯỚC 4: TẠO ĐƠN HÀNG TRONG DATABASE ---
    const order = await Order.create({
      user: userId,
      customerInfo,
      shippingInfo,
      items: orderItems,
      summary,
      paymentMethod,
      appliedVoucher: selectedVoucher
        ? {
            code: selectedVoucher.code,
            type: selectedVoucher.type,
            value: selectedVoucher.value,
          }
        : null,
      usedPoints:
        summary.pointsDiscount > 0 ? summary.pointsDiscount / 1000 : 0,
      statusHistory: [{ status: "pending" }],
    });

    // --- BƯỚC 5: DỌN DẸP GIỎ HÀNG ---
    if (userId) {
      const variantIdsToRemove = orderItems.map((item) => item.variant._id);
      await Cart.updateOne(
        { user: userId },
        { $pull: { items: { "variant._id": { $in: variantIdsToRemove } } } }
      );
    }

    try {
      // Tạo nội dung HTML cho email
      const itemsHtml = order.items
        .map(
          (item) => `
                <tr>
                    <td>${item.variant.name} (${item.variant.variantName})</td>
                    <td align="center">${item.quantity}</td>
                    <td align="right">${currency(
                      item.variant.price * item.quantity
                    )}</td>
                </tr>
            `
        )
        .join("");

      const emailHtml = `
                <h1>Cảm ơn bạn đã đặt hàng!</h1>
                <p>Chào ${order.customerInfo.name},</p>
                <p>Đơn hàng #${
                  order._id
                } của bạn đã được tiếp nhận và đang được xử lý.</p>
                <h3>Chi tiết đơn hàng:</h3>
                <table border="1" cellpadding="10" cellspacing="0" width="100%">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr><td colspan="2" align="right">Tạm tính:</td><td align="right">${currency(
                          order.summary.subtotal
                        )}</td></tr>
                        <tr><td colspan="2" align="right">Giảm giá:</td><td align="right">-${currency(
                          order.summary.voucherDiscount +
                            order.summary.pointsDiscount
                        )}</td></tr>
                        <tr><td colspan="2" align="right">Phí vận chuyển:</td><td align="right">${currency(
                          order.summary.shippingFee
                        )}</td></tr>
                        <tr><td colspan="2" align="right"><b>Tổng cộng:</b></td><td align="right"><b>${currency(
                          order.summary.finalTotal
                        )}</b></td></tr>
                    </tfoot>
                </table>
                <h3>Thông tin giao hàng:</h3>
                <p>
                    <b>Người nhận:</b> ${order.shippingInfo.receiverName}<br>
                    <b>Số điện thoại:</b> ${
                      order.shippingInfo.receiverPhone
                    }<br>
                    <b>Địa chỉ:</b> ${order.shippingInfo.fullAddress}
                </p>
            `;

      await sendEmail({
        to: order.customerInfo.email,
        subject: `[PHỐ LINK KIỆN] Xác nhận đơn hàng #${order._id}`,
        html: emailHtml,
      });

      // Gửi thêm email thông báo tài khoản nếu là khách mới
      if (newAccountPassword) {
        await sendEmail({
          to: customerInfo.email,
          subject:
            "[Tên Cửa Hàng] Chào mừng bạn! Tài khoản của bạn đã được tạo.",
          html: `<h3>Chào ${customerInfo.name},</h3>
                           <p>Một tài khoản đã được tự động tạo cho bạn tại trang web của chúng tôi.</p>
                           <p>Bạn có thể đăng nhập bằng email này và mật khẩu tạm thời: <b>${newAccountPassword}</b></p>
                           <p>Chúng tôi khuyên bạn nên đổi mật khẩu sau khi đăng nhập lần đầu tiên.</p>`,
        });
      }
    } catch (emailError) {
      console.error(
        "LỖI GỬI EMAIL (nhưng đơn hàng đã tạo thành công):",
        emailError
      );
      // Quan trọng: Không `return` lỗi ở đây để không làm người dùng hoang mang.
      // Đơn hàng đã được tạo, chỉ là không gửi được mail.
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Lỗi Server khi tạo đơn hàng",
    });
  }
};
