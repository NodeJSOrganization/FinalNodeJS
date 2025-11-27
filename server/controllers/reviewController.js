const Review = require("../models/Review");

exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "fullName avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Lỗi Server" });
  }
};

exports.createReview = async (req, res, next) => {
  const { text, rating, authorName } = req.body;
  const { productId } = req.params;
  const user = req.user;

  const hasText = text && text.trim() !== "";
  const hasRating = rating !== undefined && rating !== null && rating > 0;

  if (!hasText && !hasRating) {
    return res.status(400).json({
      success: false,
      msg: "Vui lòng nhập bình luận hoặc chọn đánh giá sao.",
    });
  }

  if (hasRating && !user) {
    return res.status(401).json({
      success: false,
      msg: "Phải đăng nhập để đánh giá sao.",
    });
  }

  try {
    let review;
    let statusCode = 201;

    if (user) {
      const existingReview = await Review.findOne({
        product: productId,
        user: user._id,
      });

      if (existingReview) {
        if (hasText) {
          existingReview.text = text;
        }
        if (hasRating) {
          existingReview.rating = rating;
        }
        review = await existingReview.save();
        statusCode = 200;
      }
    }

    // Chỉ tạo mới khi:
    // 1. Người gửi là khách (user không tồn tại)
    // 2. Người gửi là user nhưng chưa có review nào trước đó (không tìm thấy existingReview)
    if (!review) {
      const reviewData = {
        product: productId,
        text: text,
        user: user ? user._id : null,
        authorName: user ? user.fullName : authorName || "Khách",
        rating: hasRating ? rating : undefined,
      };
      review = await Review.create(reviewData);
    }

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "fullName avatar"
    );
    const eventName = statusCode === 200 ? "reviewUpdated" : "newReview";
    req.io.to(productId).emit(eventName, populatedReview);
    res.status(statusCode).json({ success: true, data: populatedReview });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, msg: "Lỗi Server", error: error.message });
  }
};
