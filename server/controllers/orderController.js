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
        // const randomPassword = crypto.randomBytes(6).toString("hex"); // Tạo mật khẩu ngẫu nhiên
        // const newUser = await User.create({
        //   fullName: customerInfo.name,
        //   email: customerInfo.email,
        //   phoneNumber: customerInfo.phone,
        //   password: randomPassword, // QUAN TRỌNG: User model của bạn cần có middleware pre-save để HASH mật khẩu này
        // });
        // userId = newUser._id;
        newAccountPassword = crypto.randomBytes(6).toString("hex");
        const newUser = await User.create({
          fullName: customerInfo.name,
          email: customerInfo.email,
          phoneNumber: customerInfo.phone,
          password: newAccountPassword, // User model sẽ tự động hash mật khẩu này
        });
        userId = newUser._id;

        // Gửi email chào mừng và thông báo mật khẩu tạm thời
        try {
          await sendEmail({
            to: newUser.email,
            subject: "Chào mừng bạn! Tài khoản của bạn đã được tạo.",
            html: `<h3>Chào ${newUser.fullName},</h3>
                       <p>Một tài khoản đã được tự động tạo cho bạn tại trang web của chúng tôi.</p>
                       <p>Bạn có thể đăng nhập bằng email này và mật khẩu tạm thời: <b>${newAccountPassword}</b></p>
                       <p>Chúng tôi khuyên bạn nên đổi mật khẩu sau khi đăng nhập lần đầu tiên.</p>`,
          });
        } catch (emailError) {
          console.error("Lỗi khi gửi email tạo tài khoản:", emailError);
          // Không chặn quy trình đặt hàng nếu chỉ lỗi gửi mail
        }
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
      const itemsHtml = order.items
        .map(
          (item) => `
            <div style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center;">
                <img src="${
                  item.variant.image
                }" alt="Product Image" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px; border-radius: 8px;">
                <div style="flex-grow: 1;">
                    <p style="margin: 0; font-weight: bold; color: #333333;">${
                      item.variant.name
                    }</p>
                    <p style="margin: 5px 0 0; color: #777777; font-size: 14px;">${
                      item.variant.variantName
                    } | Số lượng: ${item.quantity}</p>
                </div>
                <p style="margin: 0; font-weight: 500; color: #333333;">${currency(
                  item.variant.price * item.quantity
                )}</p>
            </div>
        `
        )
        .join("");

      // Mẫu email HTML hoàn chỉnh với màu sắc
      const emailHtml = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Xác nhận đơn hàng</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f7f6;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center">
                        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                            
                            <!-- Header -->
                            <tr>
                                <td style="background-color: #0d6efd; padding: 30px; text-align: center; color: white;">
                                    <h1 style="margin: 0; font-size: 28px;">Cảm ơn bạn đã đặt hàng!</h1>
                                </td>
                            </tr>

                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 30px 40px;">
                                    <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                                        Chào <strong>${
                                          order.customerInfo.name
                                        }</strong>,
                                    </p>
                                    <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                                        Đơn hàng <strong>#${order._id
                                          .toString()
                                          .slice(-6)
                                          .toUpperCase()}</strong> của bạn tại PHỐ LINH KIỆN đã được tiếp nhận và đang được xử lý.
                                    </p>

                                    <!-- Order Summary -->
                                    <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                                        <h3 style="margin-top: 0; border-bottom: 2px solid #eeeeee; padding-bottom: 10px; color: #0d6efd;">Tóm tắt đơn hàng</h3>
                                        ${itemsHtml}
                                        <div style="padding-top: 20px; font-size: 15px;">
                                            <p style="display: flex; justify-content: space-between; margin: 10px 0;"><span>Tạm tính:</span> <span>${currency(
                                              order.summary.subtotal
                                            )}</span></p>
                                            ${
                                              order.summary.voucherDiscount +
                                                order.summary.pointsDiscount >
                                              0
                                                ? `<p style="display: flex; justify-content: space-between; margin: 10px 0; color: #e74c3c;"><span>Giảm giá:</span> <span>-${currency(
                                                    order.summary
                                                      .voucherDiscount +
                                                      order.summary
                                                        .pointsDiscount
                                                  )}</span></p>`
                                                : ""
                                            }
                                            <p style="display: flex; justify-content: space-between; margin: 10px 0;"><span>Phí vận chuyển:</span> <span>${currency(
                                              order.summary.shippingFee
                                            )}</span></p>
                                            <hr style="border: none; border-top: 1px solid #e0e0e0;">
                                            <p style="display: flex; justify-content: space-between; margin: 10px 0; font-weight: bold; font-size: 18px; color: #e74c3c;"><span>Tổng cộng:</span> <span>${currency(
                                              order.summary.finalTotal
                                            )}</span></p>
                                        </div>
                                    </div>

                                    <!-- Shipping Details -->
                                    <div style="margin-top: 30px;">
                                        <h3 style="border-bottom: 2px solid #eeeeee; padding-bottom: 10px; color: #0d6efd;">Thông tin giao hàng</h3>
                                        <p style="font-size: 15px; color: #555555; line-height: 1.7;">
                                            <strong>Người nhận:</strong> ${
                                              order.shippingInfo.receiverName
                                            }<br>
                                            <strong>Số điện thoại:</strong> ${
                                              order.shippingInfo.receiverPhone
                                            }<br>
                                            <strong>Địa chỉ:</strong> ${
                                              order.shippingInfo.fullAddress
                                            }
                                        </p>
                                    </div>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f4f7f6; padding: 20px 40px; text-align: center; color: #888888; font-size: 12px;">
                                    <p style="margin: 0;">Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ chúng tôi.</p>
                                    <p style="margin: 5px 0 0;">PHỐ LINH KIỆN | &copy; ${new Date().getFullYear()}</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
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
