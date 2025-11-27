// models/Order.js
const mongoose = require('mongoose');

// Mỗi sản phẩm trong đơn
const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // hoặc ObjectId / object cũ đều được
  variant: { type: Object }, // cho phép lưu snapshot variant cũ
  name: String,
  image: String,
  variantName: String,
  variantId: String,
  qty: { type: Number, default: 1 },
  price: Number,          // giá bạn đang dùng trong DB cũ
  priceOriginal: Number,  // để FE tính lại, nếu khác với price
  discount: Number        // 0.1 = -10%
});

// Thông tin người nhận (dùng cho FE)
const RecipientSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String
});

// Dữ liệu cũ trong collection orders (để đọc lại)
const CustomerInfoSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String
});

const ShippingInfoSchema = new mongoose.Schema({
  receiverName: String,
  receiverPhone: String,
  fullAddress: String,
  note: String
});

const SummarySchema = new mongoose.Schema({
  subtotal: Number,
  shippingFee: Number,
  voucherDiscount: Number,
  pointsDiscount: Number,
  paymentMethod: String,
  finalTotal: Number
});

const StatusHistorySchema = new mongoose.Schema({
  status: String,
  currentStatus: String,
  note: String,
  createdAt: { type: Date, default: Date.now }
});

const AppliedVoucherSchema = new mongoose.Schema({
  code: String,
  type: String,   // percent, fixed, ...
  value: Number
});

const OrderSchema = new mongoose.Schema(
  {
    // user mới của hệ thống hiện tại
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Mã đơn hiển thị
    orderId: { type: String, unique: true },

    // Trạng thái cho FE
    status: {
      type: String,
      enum: ['PENDING', 'READY', 'SHIPPING', 'COMPLETED', 'CANCELED'],
      default: 'PENDING'
    },

    // ====== CẤU TRÚC CŨ TRONG DB (để tái sử dụng) ======
    customerInfo: CustomerInfoSchema,
    shippingInfo: ShippingInfoSchema,
    summary: SummarySchema,
    statusHistory: [StatusHistorySchema],
    appliedVoucher: AppliedVoucherSchema,
    usedPoints: { type: Number, default: 0 },

    // ====== Danh sách sản phẩm ======
    items: [OrderItemSchema],

    // ====== Một số field phẳng phục vụ FE (tùy dùng / không) ======
    paymentMethod: String,
    shippingFee: { type: Number, default: 0 },
    couponCode: String,
    couponDiscount: { type: Number, default: 0 },
    pointsUsed: { type: Number, default: 0 },

    recipient: RecipientSchema
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
