const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");

const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @desc    Lấy giỏ hàng của người dùng
// @route   GET /api/v1/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await findOrCreateCart(req.user.id);

    await cart.populate({
      path: "items.product",
      select: "name images",
    });

    res.status(200).json({ success: true, data: cart.items });
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
      cart.items.push({
        product: productId,
        variant: {
          _id: variant._id,
          name: product.name,
          variantName: `${variant.color} - ${variant.performance}`,
          image: variant.image?.url,
          price: variant.sellingPrice,
          sku: variant.sku,
        },
        quantity: quantity,
      });
    }

    await cart.save();

    await cart.populate({ path: "items.product", select: "name images" });

    res.status(200).json({ success: true, data: cart.items });
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
      await cart.populate({ path: "items.product", select: "name images" });
      return res.status(200).json({ success: true, data: cart.items });
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
    ).populate({ path: "items.product", select: "name images" });

    if (!cart) {
      return res.status(200).json({ success: true, data: [] });
    }

    res.status(200).json({ success: true, data: cart.items });
  } catch (error) {
    console.error("Error in removeCartItem:", error);
    res.status(500).json({ success: false, msg: "Lỗi Server" });
  }
};

// @desc    Hợp nhất giỏ hàng từ localStorage vào giỏ hàng trong DB khi user đăng nhập
// @route   POST /api/v1/cart/merge
exports.mergeCart = async (req, res) => {
  // guestCartItems là mảng các item từ localStorage mà frontend gửi lên
  const { guestCartItems } = req.body;

  if (!Array.isArray(guestCartItems) || guestCartItems.length === 0) {
    return res
      .status(200)
      .json({ success: true, msg: "Không có gì để hợp nhất." });
  }

  try {
    const cart = await findOrCreateCart(req.user.id);

    guestCartItems.forEach((guestItem) => {
      const itemIndex = cart.items.findIndex((dbItem) =>
        dbItem.variant._id.equals(
          new mongoose.Types.ObjectId(guestItem.variant._id)
        )
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += guestItem.quantity;
      } else {
        cart.items.push(guestItem);
      }
    });

    await cart.save();
    await cart.populate({ path: "items.product", select: "name images" });

    res.status(200).json({ success: true, data: cart.items });
  } catch (error) {
    console.error("Error in mergeCart:", error);
    res.status(500).json({ success: false, msg: "Lỗi Server" });
  }
};
