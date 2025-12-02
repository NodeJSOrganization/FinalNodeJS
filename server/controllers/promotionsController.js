// controllers/promotionsController.js
const Promotion = require("../models/Promotion");

// @desc    Tạo chương trình khuyến mãi mới
// @route   POST /api/v1/promotions
// @access  Private/Admin
exports.createPromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.create(req.body);
    res.status(201).json({ success: true, data: promotion });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, msg: messages.join(", ") });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        msg: "Tên chương trình khuyến mãi đã tồn tại",
      });
    }
    res
      .status(500)
      .json({ success: false, msg: "Lỗi server", error: error.message });
  }
};

// @desc    Lấy tất cả chương trình khuyến mãi
// @route   GET /api/v1/promotions
// @access  Private/Admin
exports.getPromotions = async (req, res, next) => {
  try {
    const promotions = await Promotion.find({
      status: "active",
      endDate: { $gte: new Date() },
    }).populate("appliedProducts", "name images");
    res
      .status(200)
      .json({ success: true, count: promotions.length, data: promotions });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, msg: "Lỗi server", error: error.message });
  }
};

// @desc    Cập nhật một chương trình khuyến mãi
// @route   PUT /api/v1/promotions/:id
// @access  Private/Admin
exports.updatePromotion = async (req, res, next) => {
  try {
    let promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        msg: `Không tìm thấy khuyến mãi với ID ${req.params.id}`,
      });
    }

    promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: promotion });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, msg: messages.join(", ") });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        msg: "Tên chương trình khuyến mãi đã tồn tại",
      });
    }
    res
      .status(500)
      .json({ success: false, msg: "Lỗi server", error: error.message });
  }
};

// @desc    Xóa một chương trình khuyến mãi
// @route   DELETE /api/v1/promotions/:id
// @access  Private/Admin
exports.deletePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        msg: `Không tìm thấy khuyến mãi với ID ${req.params.id}`,
      });
    }

    await promotion.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, msg: "Lỗi server", error: error.message });
  }
};

// @desc    Xóa TẤT CẢ chương trình khuyến mãi
// @route   DELETE /api/v1/promotions
// @access  Private/Admin
exports.deleteAllPromotions = async (req, res, next) => {
  try {
    const result = await Promotion.deleteMany({});
    res.status(200).json({
      success: true,
      msg: `Đã xóa thành công ${result.deletedCount} chương trình khuyến mãi.`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, msg: "Lỗi server", error: error.message });
  }
};

// @desc    Lấy thông tin chi tiết một chương trình khuyến mãi
// @route   GET /api/v1/promotions/:id
// @access  Private/Admin
exports.getPromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        msg: `Không tìm thấy khuyến mãi với ID ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: promotion });
  } catch (error) {
    res.status(400).json({ success: false, msg: "ID không hợp lệ" });
  }
};
