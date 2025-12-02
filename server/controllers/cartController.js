const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const Promotion = require("../models/Promotion"); // Đã xác nhận cần import

// --- KHỐI HELPER FUNCTION CẦN THIẾT ---
const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// Hàm Helper tính giá cuối cùng cho item trong giỏ hàng (Áp dụng logic khuyến mãi)
const calculateFinalPriceForCart = (productId, originalPrice, promotions) => {
  let finalPrice = originalPrice;

  if (!promotions || promotions.length === 0) return originalPrice; // KHÔNG CÓ KHUYẾN MÃI

  // Tìm khuyến mãi tốt nhất áp dụng cho sản phẩm này
  const applicablePromotions = promotions.filter(
    (promo) =>
      promo.status === "active" &&
      new Date(promo.startDate) <= new Date() &&
      new Date(promo.endDate) >= new Date() &&
      // Đảm bảo đối chiếu ID hợp lệ
      promo.appliedProducts.some((p) => p.toString() === productId.toString())
  );

  let maxReduction = 0;
  applicablePromotions.forEach((promo) => {
    let reduction = 0;
    if (promo.type === "percent") {
      reduction = originalPrice * (promo.value / 100);
    } else if (promo.type === "fixed_amount") {
      reduction = promo.value;
    }

    if (reduction > maxReduction) {
      maxReduction = reduction;
    }
  });

  finalPrice = originalPrice - maxReduction;
  return Math.max(0, finalPrice);
};
// ----------------------------------------

// @desc    Lấy giỏ hàng của người dùng
// @route   GET /api/v1/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await findOrCreateCart(req.user.id);

    // FIX: Populate cần lấy Variants để tìm sellingPrice gốc
    await cart.populate({
      path: "items.product",
      select: "name images variants",
    });

    // Tải tất cả khuyến mãi đang active (An toàn, nếu không có sẽ là mảng rỗng)
    const promotions = await Promotion.find({
      status: "active",
      endDate: { $gte: new Date() },
    });

    const itemsWithPrice = await Promise.all(
      cart.items.map(async (item) => {
        const productId = item.product._id;

        // 1. TÌM BIẾN THỂ VÀ GIÁ GỐC
        const variantDetails = item.product.variants.find((v) =>
          v._id.equals(item.variant._id)
        );

        // Lấy giá gốc từ Product.variants.sellingPrice
        const originalPrice =
          variantDetails?.sellingPrice || item.variant.price || 0;

        // 2. Tính giá cuối cùng (đã giảm)
        const finalPrice = calculateFinalPriceForCart(
          productId,
          originalPrice,
          promotions
        );

        // 3. Trả về item đã cập nhật giá và giá gốc (để hiển thị gạch ngang)
        return {
          ...item.toObject(),
          product: item.product.toObject(),
          variant: {
            ...item.variant.toObject(),
            price: finalPrice, // Giá đã giảm (sẽ được dùng cho tính toán tổng)
            originalPrice: originalPrice, // <-- GIÁ GỐC ĐỂ HIỂN THỊ GẠCH NGANG
          },
        };
      })
    );

    res.status(200).json({ success: true, data: itemsWithPrice });
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({ success: false, msg: "Lỗi Server" });
  }
};

// @desc    Thêm sản phẩm vào giỏ hàng
// @route   POST /api/v1/cart
exports.addToCart = async (req, res) => {
  const { productId, variantId, quantity = 1 } = req.body;

  try {
    const cart = await findOrCreateCart(req.user.id);
    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, msg: "Không tìm thấy sản phẩm" });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res
        .status(404)
        .json({ success: false, msg: "Không tìm thấy biến thể sản phẩm" });
    }

    const itemIndex = cart.items.findIndex((item) =>
      item.variant._id.equals(variantId)
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Khi thêm mới, LƯU GIÁ GỐC TỪ DB (variant.sellingPrice)
      cart.items.push({
        product: productId,
        variant: {
          _id: variant._id,
          name: product.name,
          variantName: `${variant.color} - ${variant.performance}`,
          image: variant.image?.url,
          // LƯU GIÁ GỐC ĐỂ getCart CÓ THỂ TÍNH TOÁN LẠI CHÍNH XÁC
          price: variant.sellingPrice,
          sku: variant.sku,
        },
        quantity: quantity,
      });
    }

    await cart.save();

    // Dùng getCart để trả về dữ liệu đã tính toán khuyến mãi
    return exports.getCart(req, res);
  } catch (error) {
    console.error("Error in addToCart:", error);
    res
      .status(500)
      .json({ success: false, msg: "Lỗi Server", error: error.message });
  }
};

// @desc    Cập nhật số lượng hoặc xóa item
// @route   PUT /api/v1/cart/:variantId
exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const { variantId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, msg: "Không tìm thấy giỏ hàng" });
    }

    const itemIndex = cart.items.findIndex((item) =>
      item.variant._id.equals(new mongoose.Types.ObjectId(variantId))
    );

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      await cart.save();

      // Dùng getCart để trả về dữ liệu đã tính toán khuyến mãi
      return exports.getCart(req, res);
    }

    return res
      .status(404)
      .json({ success: false, msg: "Sản phẩm không có trong giỏ hàng" });
  } catch (error) {
    console.error("Error in updateCartItem:", error);
    res.status(500).json({ success: false, msg: "Lỗi Server" });
  }
};

// @desc    Xóa một item khỏi giỏ hàng
// @route   DELETE /api/v1/cart/:variantId
exports.removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      {
        $pull: {
          items: {
            "variant._id": new mongoose.Types.ObjectId(req.params.variantId),
          },
        },
      },
      { new: true }
    );

    // Dùng getCart để trả về dữ liệu đã tính toán khuyến mãi
    return exports.getCart(req, res);
  } catch (error) {
    console.error("Error in removeCartItem:", error);
    res.status(500).json({ success: false, msg: "Lỗi Server" });
  }
};

// @desc    Hợp nhất giỏ hàng từ localStorage vào giỏ hàng trong DB khi user đăng nhập
// @route   POST /api/v1/cart/merge
exports.mergeCart = async (req, res) => {
  const { guestCartItems } = req.body;

  if (!Array.isArray(guestCartItems) || guestCartItems.length === 0) {
    return exports.getCart(req, res); // Trả về giỏ hàng DB nếu không có gì để merge
  }

  try {
    const cart = await findOrCreateCart(req.user.id);

    guestCartItems.forEach(async (guestItem) => {
      const itemIndex = cart.items.findIndex((dbItem) =>
        dbItem.variant._id.equals(
          new mongoose.Types.ObjectId(guestItem.variant._id)
        )
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += guestItem.quantity;
      } else {
        // LƯU Ý: Ở đây, guestItem.variant.price có thể là giá giảm từ frontend,
        // nhưng chúng ta vẫn lưu nó vào DB và để getCart tính toán lại.
        cart.items.push(guestItem);
      }
    });

    await cart.save();

    // Dùng getCart để trả về dữ liệu đã tính toán khuyến mãi
    return exports.getCart(req, res);
  } catch (error) {
    console.error("Error in mergeCart:", error);
    res.status(500).json({ success: false, msg: "Lỗi Server" });
  }
};
