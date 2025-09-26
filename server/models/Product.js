// models/Product.js
const mongoose = require("mongoose");

// Định nghĩa Schema cho một biến thể (Variant)
const VariantSchema = new mongoose.Schema({
  color: {
    type: String,
    required: [true, "Vui lòng nhập màu sắc"],
  },
  performance: {
    type: String, // Ví dụ: "8GB RAM / 256GB SSD"
    required: [true, "Vui lòng nhập thông số hiệu năng"],
  },
  costPrice: {
    type: Number,
    required: [true, "Vui lòng nhập giá nhập hàng"],
  },
  sellingPrice: {
    type: Number,
    required: [true, "Vui lòng nhập giá bán"],
  },
  image: {
    url: { type: String },
    cloudinary_id: { type: String },
  },
  sku: {
    type: String,
    trim: true,
    unique: true, // Bạn có thể bật unique nếu muốn SKU là duy nhất trên toàn hệ thống
  },
  quantity: {
    type: Number,
    required: [true, "Vui lòng nhập số lượng tồn kho"],
    default: 0,
    min: [0, "Số lượng không thể là số âm"],
  },
});

// Định nghĩa Schema chính cho Sản phẩm (Product)
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên sản phẩm"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Vui lòng nhập mô tả sản phẩm"],
    },
    // Mảng chứa các ảnh chung của sản phẩm
    images: [
      {
        url: { type: String, required: true },
        cloudinary_id: { type: String, required: true },
      },
    ],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category", // Tham chiếu đến Model Category
      required: [true, "Vui lòng chọn danh mục"],
    },
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand", // Tham chiếu đến Model Brand
      required: [true, "Vui lòng chọn thương hiệu"],
    },
    // Mảng các biến thể được nhúng trực tiếp vào sản phẩm
    variants: [VariantSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", ProductSchema);
