const express = require("express");
const { getReviews, createReview } = require("../controllers/reviewController");
const { protect, protectOptional } = require("../middleware/auth");

const router = express.Router();

router.get("/product/:productId", getReviews);

router.post("/product/:productId", protectOptional, createReview);

module.exports = router;
