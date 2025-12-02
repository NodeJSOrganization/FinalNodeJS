const express = require("express");

const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus, 
  deleteOrder,
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


// Route: Tạo đơn hàng & Lấy tất cả (Admin)
router
  .route("/")
  .post(protectOptional, createOrder)
  .get(protect, authorize("admin"), getAllOrders);

// Route: User lấy danh sách đơn của mình (Phải đặt trước /:id)
router.route("/myorders").get(protect, getMyOrders);

// Route: Xử lý chi tiết đơn hàng theo ID
router
  .route("/:id")
  .get(protect, getOrderById) // User xem chi tiết đơn (đã có logic check owner trong controller)
  .put(protect, authorize("admin"), updateOrderStatus) // Admin cập nhật trạng thái
  .delete(protect, authorize("admin"), deleteOrder);   // Admin xóa đơn


module.exports = router;
