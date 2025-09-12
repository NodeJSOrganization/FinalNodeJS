// routes/inventory.js
const express = require('express');
const { getInventory, updateInventory } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Áp dụng middleware cho tất cả route bên dưới
router.use(protect, authorize('admin'));

router.route('/')
    .get(getInventory);

router.route('/:productId/:variantId')
    .put(updateInventory);

module.exports = router;