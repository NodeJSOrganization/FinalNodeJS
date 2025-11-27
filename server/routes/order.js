// routes/orders.js
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createOrder,
  getMyOrders,
  // getOrder,
  // getOrders,       // cho admin
  // updateOrderStatus
} = require('../controllers/orderController');

const router = express.Router();

router.use(protect);

// user thường
router.get('/my', getMyOrders);
router.post('/', createOrder);
// router.get('/:id', getOrder);

// admin
// router.use(authorize('admin'));
// router.get('/', getOrders);
// router.put('/:id/status', updateOrderStatus);

module.exports = router;
