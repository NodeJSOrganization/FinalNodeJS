const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  mergeCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// vẫn giữ protect vì mọi thao tác lên database đều phải được xác thực
router.use(protect);

//'/api/v1/cart'
router.route("/").get(getCart).post(addToCart);

// '/api/v1/cart/merge'
router.post("/merge", mergeCart);

// '/api/v1/cart/:variantId'
router.route("/:variantId").put(updateCartItem).delete(removeCartItem);

module.exports = router;
