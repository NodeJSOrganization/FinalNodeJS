// routes/brands.js
const express = require('express');
const {
    createBrand,
    getBrands,
    getBrand,
    updateBrand,
    deleteBrand,
    deleteAllBrands
} = require('../controllers/brandsController');

// Import middlewares
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Route cho endpoint '/'
router.route('/')
    .get(getBrands)
    .post(protect, authorize('admin'), upload.single('logo'), createBrand)
    .delete(protect, authorize('admin'), deleteAllBrands);
    // upload.single('logo') là middlewa   re xử lý file ảnh có key là 'logo'

// Route cho endpoint '/:id'
router.route('/:id')
    .get(getBrand)
    .put(protect, authorize('admin'), upload.single('logo'), updateBrand)
    .delete(protect, authorize('admin'), deleteBrand);

module.exports = router;