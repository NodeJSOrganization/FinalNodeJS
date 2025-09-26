const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review phải thuộc về một sản phẩm"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: false,
    },
    text: {
      type: String,
      required: [true, "Vui lòng nhập nội dung comment"],
      trim: true,
      maxlength: [500, "Comment không được quá 500 ký tự"],
    },
    rating: {
      type: Number,
      min: [1, "Rating phải từ 1 sao"],
      max: [5, "Rating phải từ 5 sao"],
      required: false,
    },
    authorName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model("Review", ReviewSchema);
