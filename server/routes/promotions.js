const express = require("express");
const {
  createPromotion,
  getPromotions,
  updatePromotion,
  deletePromotion,
  deleteAllPromotions,
  getPromotion,
} = require("../controllers/promotionsController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router
  .route("/")
  .get(getPromotions) // Public access cho Frontend/Home Page

  .post(protect, authorize("admin"), createPromotion)
  .delete(protect, authorize("admin"), deleteAllPromotions);

router
  .route("/:id")
  .get(protect, authorize("admin"), getPromotion)
  .put(protect, authorize("admin"), updatePromotion)
  .delete(protect, authorize("admin"), deletePromotion);

module.exports = router;
