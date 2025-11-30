const Order = require("../models/Order");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmailWhenCreateOrder");

// Helper function để định dạng tiền tệ
const currency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v
  );

/**
 * @desc    Tạo đơn hàng mới
 * @route   POST /api/v1/orders
 * @access  Public (sử dụng protectOptional)
 */
exports.createOrder = async (req, res) => {
  const {
    orderItems,
    customerInfo,
    shippingInfo,
    summary,
    paymentMethod,
    selectedVoucher,
    usePoints,
  } = req.body;

  const loggedInUser = req.user;
  let userId = loggedInUser ? loggedInUser._id : null;
  let newAccountPassword = null;

  try {
    if (!loggedInUser && customerInfo && customerInfo.email) {
      const existingUser = await User.findOne({ email: customerInfo.email });
      if (existingUser) {
        userId = existingUser._id;
      } else {
        newAccountPassword = crypto.randomBytes(6).toString("hex");
        const newUser = await User.create({
          fullName: customerInfo.name,
          email: customerInfo.email,
          phoneNumber: customerInfo.phone,
          password: newAccountPassword,
          isVerified: true,
        });
        userId = newUser._id;
      }
    }

    const stockUpdateOperations = [];
    for (const item of orderItems) {
      const productId = item.product?._id || item.product;
      const product = await Product.findById(productId);
      if (!product)
        throw new Error(`Sản phẩm với ID ${productId} không tồn tại.`);
      const variant = product.variants.id(item.variant._id);
      if (!variant)
        throw new Error(`Biến thể cho sản phẩm ${product.name} không tồn tại.`);
      if (variant.quantity < item.quantity) {
        throw new Error(
          `Sản phẩm "${product.name} - ${item.variant.variantName}" không đủ số lượng tồn kho (chỉ còn ${variant.quantity}).`
        );
      }
      variant.quantity -= item.quantity;
      stockUpdateOperations.push(product.save());
    }
    await Promise.all(stockUpdateOperations);

    const order = await Order.create({
      user: userId,
      customerInfo,
      shippingInfo,
      items: orderItems,
      summary,
      paymentMethod,
      appliedVoucher: selectedVoucher,
      usedPoints:
        summary.pointsDiscount > 0 ? summary.pointsDiscount / 1000 : 0,
      statusHistory: [{ status: "pending" }],
    });

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
                <div style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; text-align: left;">
                        <img src="${item.variant.image}" alt="${
            item.variant.name
          }" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px; border-radius: 8px;">
                        <div>
                            <p style="margin: 0; font-weight: bold; color: #333333;">${
                              item.variant.name
                            }</p>
                            <p style="margin: 5px 0 0; color: #777777; font-size: 14px;">${
                              item.variant.variantName
                            } | SL: ${item.quantity}</p>
                        </div>
                    </div>
                    <p style="margin: 0; font-weight: 500; color: #333333; text-align: right;">${currency(
                      item.variant.price * item.quantity
                    )}</p>
                </div>
            `
        )
        .join("");

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
                                    <tr>
                                        <td style="background-color: #0d6efd; padding: 30px; text-align: center; color: white;">
                                            <h1 style="margin: 0; font-size: 28px;">Cảm ơn bạn đã đặt hàng!</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 30px 40px;">
                                            <p style="font-size: 16px; color: #555555; line-height: 1.6;">Chào <strong>${
                                              order.customerInfo.name
                                            }</strong>,</p>
                                            <p style="font-size: 16px; color: #555555; line-height: 1.6;">Đơn hàng <strong>#${order._id
                                              .toString()
                                              .slice(-6)
                                              .toUpperCase()}</strong> của bạn tại PHỐ LINH KIỆN đã được tiếp nhận và đang được xử lý.</p>
                                            <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                                                <h3 style="margin-top: 0; border-bottom: 2px solid #eeeeee; padding-bottom: 10px; color: #0d6efd;">Tóm tắt đơn hàng</h3>
                                                ${itemsHtml}
                                                <div style="padding-top: 20px; font-size: 15px; text-align: right;">
                                                    <p style="margin: 10px 0;"><span>Tạm tính:</span> <span style="display: inline-block; width: 120px;">${currency(
                                                      order.summary.subtotal
                                                    )}</span></p>
                                                    ${
                                                      order.summary
                                                        .voucherDiscount +
                                                        order.summary
                                                          .pointsDiscount >
                                                      0
                                                        ? `<p style="margin: 10px 0; color: #e74c3c;"><span>Giảm giá:</span> <span style="display: inline-block; width: 120px;">-${currency(
                                                            order.summary
                                                              .voucherDiscount +
                                                              order.summary
                                                                .pointsDiscount
                                                          )}</span></p>`
                                                        : ""
                                                    }
                                                    <p style="margin: 10px 0;"><span>Phí vận chuyển:</span> <span style="display: inline-block; width: 120px;">${currency(
                                                      order.summary.shippingFee
                                                    )}</span></p>
                                                    <hr style="border: none; border-top: 1px solid #e0e0e0;">
                                                    <p style="margin: 10px 0; font-weight: bold; font-size: 18px;"><span style="color: #333;">Tổng cộng:</span> <span style="display: inline-block; width: 120px; color: #e74c3c;">${currency(
                                                      order.summary.finalTotal
                                                    )}</span></p>
                                                </div>
                                            </div>
                                            <div style="margin-top: 30px;">
                                                <h3 style="border-bottom: 2px solid #eeeeee; padding-bottom: 10px; color: #0d6efd;">Thông tin giao hàng</h3>
                                                <p style="font-size: 15px; color: #555555; line-height: 1.7;"><strong>Người nhận:</strong> ${
                                                  order.shippingInfo
                                                    .receiverName
                                                }<br><strong>Số điện thoại:</strong> ${
        order.shippingInfo.receiverPhone
      }<br><strong>Địa chỉ:</strong> ${order.shippingInfo.fullAddress}</p>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="background-color: #f4f7f6; padding: 20px 40px; text-align: center; color: #888888; font-size: 12px;"><p style="margin: 5px 0 0;">PHỐ LINH KIỆN | &copy; ${new Date().getFullYear()}</p></td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>`;

      await sendEmail({
        to: order.customerInfo.email,
        subject: `[PHỐ LINH KIỆN] Xác nhận đơn hàng #${order._id
          .toString()
          .slice(-6)
          .toUpperCase()}`,
        html: emailHtml,
      });

      if (newAccountPassword) {
        const accountEmailHtml = `
                  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                      <h2 style="color: #0d6efd;">Chào mừng bạn đến với PHỐ LINH KIỆN!</h2>
                      <p>Chào <strong>${customerInfo.name}</strong>,</p>
                      <p>Một tài khoản đã được tự động tạo cho bạn để dễ dàng theo dõi đơn hàng và nhận các ưu đãi hấp dẫn.</p>
                      <p>Bạn có thể đăng nhập bằng thông tin dưới đây:</p>
                      <div style="background-color: #f2f2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #0d6efd;">
                          <p style="margin: 5px 0;"><strong>Email:</strong> ${customerInfo.email}</p>
                          <p style="margin: 5px 0;"><strong>Mật khẩu tạm thời:</strong> <code style="font-size: 1.2em; font-weight: bold; color: #e74c3c;">${newAccountPassword}</code></p>
                      </div>
                      <p>Chúng tôi khuyên bạn nên đổi mật khẩu sau khi đăng nhập lần đầu tiên để đảm bảo an toàn.</p>
                      <a href="http://localhost:5173/login" style="display: inline-block; background-color: #0d6efd; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Đăng nhập ngay</a>
                  </div>`;

        await sendEmail({
          to: customerInfo.email,
          subject: "[PHỐ LINH KIỆN] Thông tin tài khoản của bạn",
          html: accountEmailHtml,
        });
      }
    } catch (emailError) {
      console.error(
        "LỖI GỬI EMAIL (nhưng đơn hàng đã tạo thành công):",
        emailError
      );
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

/**
 * @desc    Lấy tất cả đơn hàng (chỉ cho Admin)
 * @route   GET /api/v1/orders
 * @access  Private/Admin
 */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Lỗi khi lấy tất cả đơn hàng:", error);
    res.status(500).json({ success: false, msg: "Lỗi Server" });
  }
};

/**
 * @desc    Lấy các đơn hàng của người dùng đang đăng nhập
 * @route   GET /api/v1/orders/myorders
 * @access  Private
 */
const mapOrderToClient = (orderDoc) => {
  const o = orderDoc.toObject();

  const statusMap = {
    pending: "PENDING",
    confirmed: "READY",
    shipping: "SHIPPING",
    delivered: "COMPLETED",
    cancelled: "CANCELED",
  };

  return {
    _id: o._id,
    orderId: "#" + o._id.toString().slice(-6).toUpperCase(), // giống email
    status: statusMap[o.currentStatus] || "PENDING",
    createdAt: o.createdAt,
    paymentMethod: o.paymentMethod, // hoặc format lại nếu muốn

    shippingFee: o.summary?.shippingFee || 0,
    couponCode: o.appliedVoucher?.code || null,
    couponDiscount: o.summary?.voucherDiscount || 0,
    pointsUsed: o.usedPoints || 0,

    recipient: {
      name: o.shippingInfo?.receiverName || "",
      phone: o.shippingInfo?.receiverPhone || "",
      address: o.shippingInfo?.fullAddress || "",
    },

    items: (o.items || []).map((item) => ({
      productId: item.product,
      image: item.variant?.image,
      name: item.variant?.name,
      variant: item.variant?.variantName,
      qty: item.quantity,
      priceOriginal: item.variant?.price,
      discount: 0, // hiện chưa có discount theo item -> set 0
    })),
  };
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    const clientOrders = orders.map(mapOrderToClient);

    res.status(200).json({
      success: true,
      count: clientOrders.length,
      data: clientOrders,
    });
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng của tôi:", error);
    res.status(500).json({ success: false, msg: "Lỗi Server" });
  }
};

/**
 * @desc    Lấy chi tiết một đơn hàng theo ID
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "fullName email"
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, msg: "Không tìm thấy đơn hàng" });
    }

    if (
      order.user &&
      order.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(401)
        .json({ success: false, msg: "Không có quyền truy cập đơn hàng này" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    res.status(500).json({ success: false, msg: "Lỗi Server" });
  }
};

exports.cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, msg: "Không tìm thấy đơn hàng" });
    }

    // Chỉ cho chủ đơn hủy
    if (!order.user || order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        msg: "Bạn không có quyền hủy đơn hàng này",
      });
    }

    // Chỉ cho phép hủy khi đang chờ xác nhận
    if (order.currentStatus !== "pending") {
      return res.status(400).json({
        success: false,
        msg: "Chỉ có thể hủy đơn hàng đang chờ xác nhận",
      });
    }

    // Thêm trạng thái cancelled vào statusHistory
    order.statusHistory.push({ status: "cancelled" });
    await order.save(); // pre('save') sẽ tự cập nhật currentStatus

    const clientOrder = mapOrderToClient(order);

    return res.status(200).json({
      success: true,
      data: clientOrder,
    });
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Lỗi Server khi hủy đơn hàng" });
  }
};