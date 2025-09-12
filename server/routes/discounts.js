// routes/discounts.js
const express = require('express');
const {
    createDiscount,
    getDiscounts,
    getDiscount,
    updateDiscount,
    deleteDiscount,
    deleteAllDiscounts
} = require('../controllers/discountsController');

// Import middleware xác thực
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Các route không yêu cầu đăng nhập (hoặc bạn có thể thêm 'protect' nếu muốn)
router.route('/')
    .get(getDiscounts);

router.route('/:id')
    .get(getDiscount);

// Các route yêu cầu quyền Admin
router.route('/')
    .post(protect, authorize('admin'), createDiscount)
    .delete(protect, authorize('admin'), deleteAllDiscounts);
    
router.route('/:id')
    .put(protect, authorize('admin'), updateDiscount)
    .delete(protect, authorize('admin'), deleteDiscount);

module.exports = router;