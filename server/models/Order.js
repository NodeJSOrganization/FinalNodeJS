const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User", // Có thể null nếu là khách
    },
    customerInfo: {
      // Lưu lại thông tin khách hàng tại thời điểm mua
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shippingInfo: {
      // Lưu lại thông tin giao hàng
      receiverName: { type: String, required: true },
      receiverPhone: { type: String, required: true },
      fullAddress: { type: String, required: true },
      note: { type: String },
    },
    items: [
      {
        product: { type: mongoose.Schema.ObjectId, ref: "Product" },
        variant: {
          _id: mongoose.Schema.ObjectId,
          name: String,
          variantName: String,
          image: String,
          price: Number,
          sku: String,
        },
        quantity: Number,
      },
    ],
    summary: {
      subtotal: { type: Number, required: true },
      shippingFee: { type: Number, default: 0 },
      voucherDiscount: { type: Number, default: 0 },
      pointsDiscount: { type: Number, default: 0 },
      finalTotal: { type: Number, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cod", "momo", "vnpay"],
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
          default: "pending",
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    currentStatus: {
      type: String,
      default: "pending",
    },
    appliedVoucher: {
      // Cho phép lưu một object nhỏ chứa thông tin cần thiết của voucher
      code: { type: String },
      type: { type: String, enum: ["fixed_amount", "percent"] },
      value: { type: Number },
    },
    usedPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Middleware để cập nhật currentStatus
OrderSchema.pre("save", function (next) {
  if (this.isModified("statusHistory")) {
    this.currentStatus =
      this.statusHistory[this.statusHistory.length - 1].status;
  }
  next();
});

module.exports = mongoose.model("Order", OrderSchema);
