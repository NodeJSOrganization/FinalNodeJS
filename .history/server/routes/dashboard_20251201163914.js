// routes/dashboard.js
const express = require('express');
const { getDashboardStats, getAnalysisData } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Chỉ Admin mới xem được dashboard
router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/analysis', getAnalysisData);

module.exports = router;