const express = require("express");

const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  cancelMyOrder,
  checkReorderStock,
} = require("../controllers/orderController");

const { protect, authorize, protectOptional } = require("../middleware/auth");

const router = express.Router();

// 1. Route gốc: Tạo đơn & Lấy tất cả danh sách
router
  .route("/")
  .post(protectOptional, createOrder)
  .get(protect, authorize("admin"), getAllOrders);

// 2. Các route chức năng phụ (Phải đặt TRƯỚC route /:id để tránh bị nhầm ID)
router.route("/myorders").get(protect, getMyOrders);
router.route("/check-reorder").post(protect, checkReorderStock);

// 3. Route thao tác trên MỘT đơn hàng cụ thể (Cần ID)
// ✨ ĐÂY LÀ CHỖ CẦN SỬA ✨
router
  .route("/:id")
  .get(protect, getOrderById) // Xem chi tiết
  .put(protect, authorize("admin"), updateOrderStatus) // Cập nhật trạng thái (Admin)
  .delete(protect, authorize("admin"), deleteOrder);   // Xóa đơn (Admin)

// 4. Route hủy đơn (Custom action trên ID)
router.route("/:id/cancel").patch(protect, cancelMyOrder);

module.exports = router;