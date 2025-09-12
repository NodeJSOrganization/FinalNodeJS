// routes/promotions.js // 
const express = require('express');
const {
    createPromotion,
    getPromotions,
    updatePromotion,
    deletePromotion,
    deleteAllPromotions,
    getPromotion,
} = require('../controllers/promotionsController');

// Import middleware xác thực và phân quyền
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Tất cả các route dưới đây đều yêu cầu đăng nhập và có quyền admin
router.use(protect, authorize('admin'));

router.route('/')
    .get(getPromotions)
    .post(createPromotion)
    .delete(deleteAllPromotions);

router.route('/:id')
    .get(getPromotion)
    .put(updatePromotion)
    .delete(deletePromotion);

module.exports = router;