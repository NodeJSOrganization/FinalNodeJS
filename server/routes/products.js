// routes/products.js
const express = require("express");
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  deleteAllProducts,
  getProduct,
  getBestSellers,
} = require("../controllers/productsController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload"); // Import instance multer chung

const router = express.Router();

// Middleware upload cho TẠO MỚI sản phẩm
const createUpload = upload.fields([
  { name: "images", maxCount: 5 },
  { name: "variant_images", maxCount: 10 },
]);

// Middleware upload cho CẬP NHẬT sản phẩm
const updateUpload = upload.fields([
  { name: "new_main_images", maxCount: 5 },
  { name: "new_variant_images", maxCount: 10 },
]);

router.route("/best-sellers").get(getBestSellers);

router
  .route("/")
  .get(getProducts)
  .post(protect, authorize("admin"), upload.any(), createProduct)
  .delete(protect, authorize("admin"), deleteAllProducts); // Sửa thành upload.any()

router
  .route("/:id")
  .get(getProduct)
  .put(protect, authorize("admin"), upload.any(), updateProduct) // Sửa thành upload.any()
  .delete(protect, authorize("admin"), deleteProduct);

module.exports = router;
