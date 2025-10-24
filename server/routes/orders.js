const express = require("express");
const { createOrder, getAllOrders } = require("../controllers/orderController");
const { protect, authorize, protectOptional } = require("../middleware/auth");

const router = express.Router();

// Định nghĩa các route cho đường dẫn gốc ('/') của '/api/v1/orders'
router
  .route("/")
  // Xử lý request POST: Tạo đơn hàng mới
  .post(protectOptional, createOrder)

  // Xử lý request GET: Lấy tất cả đơn hàng (chỉ cho admin)
  .get(protect, authorize("admin"), getAllOrders);

// Nếu sau này bạn cần thêm các route khác, hãy thêm chúng ở đây. Ví dụ:
// router.route('/myorders').get(protect, getMyOrders);
// router.route('/:id').get(protect, getOrderById);

module.exports = router;
