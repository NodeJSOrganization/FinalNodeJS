// controllers/orderController.js
const Order = require('../models/Order');

// LẤY ĐƠN HÀNG CỦA USER
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;          // user đang đăng nhập
    const userEmail = req.user.email;     // dùng email để match với customerInfo

    // 1. Thử tìm theo field "user" (cho các đơn mới về sau)
    let orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    // 2. Nếu chưa có, fallback sang schema cũ: customerInfo.email
    if (!orders.length && userEmail) {
      orders = await Order.find({ 'customerInfo.email': userEmail }).sort({
        createdAt: -1,
      });
    }

    // 3. Map dữ liệu về format FE đang dùng
    const mapped = orders.map((order) => {
      const shippingInfo = order.shippingInfo || {};
      const summary = order.summary || {};
      const appliedVoucher = order.appliedVoucher || {};

      // ===== Trạng thái đơn hàng =====
      let status = order.status;

      if (!status && Array.isArray(order.statusHistory) && order.statusHistory.length) {
        const last = order.statusHistory[order.statusHistory.length - 1];
        const raw = (last.currentStatus || last.status || '').toLowerCase();

        switch (raw) {
          case 'pending':
          case 'created':
            status = 'PENDING';
            break;
          case 'confirmed':
          case 'ready_to_pick':
            status = 'READY';
            break;
          case 'shipping':
          case 'on_delivery':
            status = 'SHIPPING';
            break;
          case 'completed':
          case 'delivered':
            status = 'COMPLETED';
            break;
          case 'cancel':
          case 'cancelled':
          case 'canceled':
            status = 'CANCELED';
            break;
          default:
            status = 'PENDING';
        }
      }

      // ===== Map danh sách sản phẩm =====
      const items = (order.items || []).map((it) => {
        const prod = it.product || {};
        const variant = it.variant || {};

        const productId =
          it.productId ||
          prod._id ||
          it._id ||
          '';

        const name = it.name || prod.name || '';
        const image =
          it.image || variant.image || prod.image || '';
        const variantName =
          it.variantName ||
          variant.variantName ||
          (typeof it.variant === 'string' ? it.variant : '') ||
          '';
        const qty = it.qty || it.quantity || 1;
        const priceOriginal =
          it.priceOriginal ??
          variant.price ??
          prod.price ??
          0;

        const discount =
          typeof it.discount === 'number' ? it.discount : 0;

        return {
          productId: productId.toString(),
          name,
          image,
          variant: variantName,
          qty,
          priceOriginal,
          discount,
        };
      });

      // ===== Map order-level fields =====
      return {
        _id: order._id,
        orderId: order.orderId || order.code || order._id.toString(), // cho FE hiển thị
        status,
        createdAt: order.createdAt,

        paymentMethod:
          order.paymentMethod || summary.paymentMethod || 'COD',
        shippingFee:
          order.shippingFee ?? summary.shippingFee ?? 0,

        couponCode:
          order.couponCode || appliedVoucher.code || '',
        couponDiscount:
          order.couponDiscount ?? summary.voucherDiscount ?? 0,

        pointsUsed:
          order.pointsUsed ?? order.usedPoints ?? 0,

        recipient: {
          name:
            order.recipient?.name ||
            shippingInfo.receiverName ||
            '',
          phone:
            order.recipient?.phone ||
            shippingInfo.receiverPhone ||
            '',
          address:
            order.recipient?.address ||
            shippingInfo.fullAddress ||
            '',
        },

        items,
      };
    });

    return res.status(200).json({
      success: true,
      count: mapped.length,
      data: mapped,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      msg: 'Lỗi server',
      error: err.message,
    });
  }
};

// TẠO ĐƠN HÀNG MỚI
exports.createOrder = async (req, res, next) => {
  try {
    // Lấy user từ middleware protect
    const userId = req.user?._id;

    // Lấy data từ FE gửi lên
    const {
      items,
      paymentMethod,
      shippingFee,
      couponCode,
      couponDiscount,
      pointsUsed,
      recipient,
    } = req.body;

    // Validate đơn giản
    if (!items || !Array.isArray(items) || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng phải có ít nhất 1 sản phẩm',
      });
    }

    // Tạo order trong DB
    const order = await Order.create({
      user: userId || undefined, // nếu chưa login thì bỏ cũng được
      items,
      paymentMethod,
      shippingFee,
      couponCode,
      couponDiscount,
      pointsUsed,
      recipient,
      // nếu bạn có các field khác (summary, shippingInfo, ...) thì thêm vào đây
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo đơn hàng thành công',
      data: order,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
