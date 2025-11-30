const express = require("express");

const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
} = require("../controllers/orderController");

const { protect, authorize, protectOptional } = require("../middleware/auth");

const router = express.Router();

router
  .route("/")
  // POST /api/v1/orders -> Tạo đơn hàng mới
  .post(protectOptional, createOrder)

  // GET /api/v1/orders -> Lấy tất cả đơn hàng (chỉ cho admin)
  .get(protect, authorize("admin"), getAllOrders);

// Route để User lấy đơn hàng CỦA MÌNH: GET /api/v1/orders/myorders
// Yêu cầu đăng nhập (`protect`). Phải đặt trước '/:id'.
router.route("/myorders").get(protect, getMyOrders);

// Route để lấy chi tiết MỘT đơn hàng theo ID: GET /api/v1/orders/:id
// Yêu cầu đăng nhập (`protect`).
router.route("/:id").get(protect, getOrderById);
// Route để hủy đơn hàng của chính mình: PATCH /api/v1/orders/:id/cancel
router.route("/:id/cancel").patch(protect, cancelMyOrder);

module.exports = router;
