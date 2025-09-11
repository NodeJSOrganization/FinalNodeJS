// routes/categories.js
const express = require('express');
const { createCategory, getCategories, updateCategory, deleteCategory, getCategory, deleteAllCategories} = require('../controllers/categoriesController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Áp dụng middleware cho route này
router.route('/')
    .get(getCategories) // GET request sẽ gọi getCategories
    .post(protect, authorize('admin'), createCategory) // POST request sẽ gọi createCategory
    .delete(protect, authorize('admin'), deleteAllCategories);

router.route('/:id')
    .get(getCategory)
    .put(protect, authorize('admin'), updateCategory)
    .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;