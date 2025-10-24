const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
    variant: {
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true }, // Tên sản phẩm (not variant)
      variantName: { type: String, required: true },
      image: { type: String }, // URL ảnh của variant
      price: { type: Number, required: true },
      sku: { type: String },
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: false }
); //

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", CartSchema);
