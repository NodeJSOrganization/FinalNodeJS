// controllers/productsController.js
const Product = require("../models/Product");
const Category = require("../models/Category");
const Promotion = require("../models/Promotion");
const Order = require("../models/Order");
const Brand = require("../models/Brand");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");

// --- HELPER FUNCTION: Xóa file tạm của multer nếu có lỗi ---
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const cleanupFilesOnError = (files) => {
  const filePaths = [];
  if (files.images) files.images.forEach((f) => filePaths.push(f.path));
  if (files.variant_images)
    files.variant_images.forEach((f) => filePaths.push(f.path));
  filePaths.forEach((path) =>
    unlinkFile(path).catch((err) =>
      console.error(`Failed to delete temp file: ${path}`, err)
    )
  );
};

// const calculateFinalPrice = (product, promotions) => {
//   // 1. LẤY GIÁ GỐC AN TOÀN
//   // Dùng optional chaining (?.) và toán tử OR (||) để tránh lỗi nếu variants rỗng
//   let originalPrice = product.variants?.[0]?.sellingPrice || 0;
//   let finalPrice = originalPrice;
//   let bestPromotion = null;

//   // 2. TÌM KHUYẾN MÃI TỐT NHẤT
//   const applicablePromotions = promotions.filter(
//     (promo) =>
//       promo.status === "active" &&
//       new Date(promo.startDate) <= new Date() &&
//       new Date(promo.endDate) >= new Date() &&
//       promo.appliedProducts.some((p) => p.toString() === product._id.toString())
//   );

//   let maxReduction = 0;
//   applicablePromotions.forEach((promo) => {
//     let reduction = 0;
//     if (promo.type === "percent") {
//       reduction = originalPrice * (promo.value / 100);
//     } else if (promo.type === "fixed_amount") {
//       reduction = promo.value;
//     }

//     if (reduction > maxReduction) {
//       maxReduction = reduction;
//       bestPromotion = promo;
//     }
//   });

//   if (bestPromotion) {
//     finalPrice = originalPrice - maxReduction;
//   }

//   // 3. GÁN TRƯỜNG MỚI VÀ TRẢ VỀ
//   product.originalPrice = originalPrice;
//   product.finalPrice = Math.max(0, finalPrice);
//   product.appliedPromotion = bestPromotion
//     ? {
//         type: bestPromotion.type,
//         value: bestPromotion.value,
//       }
//     : null;

//   return product;
// };

const calculateVariantDiscount = (originalPrice, promotions, productId) => {
  let maxReduction = 0;

  // Lọc khuyến mãi áp dụng cho sản phẩm này
  const applicablePromotions = promotions.filter(
    (promo) =>
      promo.status === "active" &&
      new Date(promo.startDate) <= new Date() &&
      new Date(promo.endDate) >= new Date() &&
      promo.appliedProducts.some((p) => p.toString() === productId.toString())
  );

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

  return maxReduction;
};

// @desc    Lấy danh sách sản phẩm bán chạy nhất
// @route   GET /api/v1/products/best-sellers
// @access  Public
exports.getBestSellers = async (req, res, next) => {
  try {
    const limit = 5;

    const aggregatedData = await Order.aggregate([
      { $unwind: "$items" },

      {
        $match: {
          "items.product": {
            $ne: null,
            $exists: true,
          },
        },
      },

      {
        $group: {
          _id: "$items.product",
          totalQuantitySold: { $sum: "$items.quantity" },
        },
      },

      { $sort: { totalQuantitySold: -1 } },
      { $limit: limit },
    ]);

    const productIds = aggregatedData.map((item) => item._id);

    const bestSellersProducts = await Product.find({ _id: { $in: productIds } })
      .populate("category", "name")
      .populate("brand", "name logo");

    const sortedBestSellers = productIds
      .map((id) =>
        bestSellersProducts.find((p) => p._id.toString() === id.toString())
      )
      .filter(Boolean);

    res.status(200).json({
      success: true,
      count: sortedBestSellers.length,
      data: sortedBestSellers,
    });
  } catch (error) {
    console.error("LỖI AGGREGATION BEST SELLERS:", error);
    res.status(500).json({
      success: false,
      msg: "Lỗi Server: Không thể tính toán Best Sellers.",
      error: error.message,
    });
  }
};

// @desc    Tạo sản phẩm mới
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, category, brand, variants } = req.body;

    // 1. Parse và kiểm tra variants
    let parsedVariants;
    try {
      parsedVariants = JSON.parse(variants);
    } catch (e) {
      return res
        .status(400)
        .json({ success: false, msg: "Variants không hợp lệ" });
    }

    // 2. req.files bây giờ là một MẢNG các object file khi dùng upload.any()
    const files = req.files;

    // 3. Tải tất cả ảnh lên Cloudinary
    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder:
          file.fieldname === "images"
            ? "products/general"
            : "products/variants",
      })
    );
    const uploadResults = await Promise.all(uploadPromises);

    // Tạo một map để dễ dàng tìm kiếm ảnh đã upload bằng fieldname
    const uploadedFilesMap = {};
    files.forEach((file, index) => {
      if (!uploadedFilesMap[file.fieldname]) {
        uploadedFilesMap[file.fieldname] = [];
      }
      uploadedFilesMap[file.fieldname].push(uploadResults[index]);
    });

    // 4. Gán ảnh vào đúng chỗ
    const productImages = (uploadedFilesMap["images"] || []).map((result) => ({
      url: result.secure_url,
      cloudinary_id: result.public_id,
    }));

    const finalVariants = parsedVariants.map((variant) => {
      const identifier = variant.imageIdentifier;
      if (
        identifier &&
        uploadedFilesMap[identifier] &&
        uploadedFilesMap[identifier][0]
      ) {
        const result = uploadedFilesMap[identifier][0];
        variant.image = {
          url: result.secure_url,
          cloudinary_id: result.public_id,
        };
      }
      delete variant.imageIdentifier; // Xóa key tạm sau khi đã xử lý
      return variant;
    });

    // 5. Tạo sản phẩm
    const product = await Product.create({
      name,
      description,
      category,
      brand,
      images: productImages,
      variants: finalVariants,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    if (req.files) cleanupFilesOnError(req.files);
    if (error.code === 11000) {
      // Kiểm tra xem lỗi trùng lặp là do 'name' hay do 'variants.sku'
      if (error.message.includes("name_1")) {
        return res
          .status(400)
          .json({ success: false, msg: "Tên sản phẩm đã tồn tại." });
      }
      if (error.message.includes("variants.sku_1")) {
        return res.status(400).json({
          success: false,
          msg: "Mã SKU của một biến thể đã tồn tại. Vui lòng kiểm tra lại.",
        });
      }
      // Trường hợp lỗi trùng lặp khác
      return res
        .status(400)
        .json({ success: false, msg: "Dữ liệu bị trùng lặp." });
    }
    console.error(error);
    res
      .status(500)
      .json({ success: false, msg: "Lỗi server", error: error.message });
  }
};

// @desc    Lấy tất cả sản phẩm
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    let filter = {};

    // 1. Xử lý Lọc theo Tên Danh mục (SỬA Ở ĐÂY)
    if (req.query.categoryName) {
      const categoryName = req.query.categoryName;

      // Tìm Category ID từ Tên Danh mục
      const category = await Category.findOne({ name: categoryName });

      if (category) {
        // Nếu tìm thấy, thêm điều kiện lọc vào object filter
        filter.category = category._id;
      } else {
        // Nếu tên danh mục không hợp lệ, trả về danh sách sản phẩm rỗng
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
    }

    // 2. Thực hiện Truy vấn Sản phẩm (kèm theo điều kiện lọc đã xây dựng)
    const products = await Product.find(filter)
      // Thêm các logic khác như phân trang, sắp xếp, tìm kiếm...
      // Ví dụ: .sort({ createdAt: -1 }).limit(10);
      .populate("category", "name")
      .populate("brand", "name logo"); // Hiển thị tên danh mục

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    // Xử lý lỗi
    res
      .status(500)
      .json({ success: false, msg: "Lỗi server", error: error.message });
  }
};

// @desc    Lấy chi tiết một sản phẩm
// @route   GET /api/v1/products/:id
// @access  Public
// exports.getProduct = async (req, res, next) => {
//   // KIỂM TRA ĐỊNH DẠNG ID
//   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//     return res
//       .status(400)
//       .json({ success: false, msg: "ID sản phẩm không đúng định dạng." });
//   }

//   try {
//     let product = await Product.findById(req.params.id)
//       .populate("category", "name")
//       .populate("brand", "name logo");

//     if (!product) {
//       return res
//         .status(404)
//         .json({ success: false, msg: `Không tìm thấy sản phẩm` });
//     }

//     // 1. Tải tất cả khuyến mãi đang active
//     const promotions = await Promotion.find({
//       status: "active",
//       endDate: { $gte: new Date() },
//     });

//     // 2. Tính toán giá cuối cùng
//     // CHUYỂN ĐỔI SANG OBJECT TRƯỚC KHI CHỈNH SỬA
//     let productObject = product.toObject();
//     productObject = calculateFinalPrice(productObject, promotions);

//     // TRẢ VỀ KẾT QUẢ
//     res.status(200).json({ success: true, data: productObject });
//   } catch (error) {
//     // Lỗi 500 SERVER ERROR
//     console.error("LỖI SERVER TRONG getProduct:", error);
//     return res
//       .status(500)
//       .json({ success: false, msg: "Lỗi server nội bộ khi xử lý sản phẩm." });
//   }
// };

exports.getProduct = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, msg: "ID sản phẩm không đúng định dạng." });
  }

  try {
    let product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("brand", "name logo");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, msg: `Không tìm thấy sản phẩm` });
    }

    const promotions = await Promotion.find({
      status: "active",
      endDate: { $gte: new Date() },
    });

    let productObject = product.toObject();
    const productIdString = productObject._id.toString();

    // Lặp qua TỪNG VARIANT và tính toán giá riêng
    productObject.variants = productObject.variants.map((variant) => {
      const originalPrice = variant.sellingPrice || 0;

      // Tính mức giảm dựa trên giá gốc của biến thể này
      const maxReduction = calculateVariantDiscount(
        originalPrice,
        promotions,
        productIdString
      );

      const finalPrice = originalPrice - maxReduction;

      // GÁN CẢ HAI GIÁ TRỊ VÀO CẤP ĐỘ VARIANT
      return {
        ...variant,
        originalPrice: originalPrice,
        finalPrice: Math.max(0, finalPrice),
      };
    });

    // Loại bỏ trường finalPrice/originalPrice cấp độ Sản phẩm
    delete productObject.finalPrice;
    delete productObject.originalPrice;

    res.status(200).json({ success: true, data: productObject });
  } catch (error) {
    console.error("LỖI SERVER TRONG getProduct:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Lỗi server nội bộ khi xử lý sản phẩm." });
  }
};
// @desc    Xóa một sản phẩm
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, msg: `Không tìm thấy sản phẩm` });
    }

    const idsToDelete = [];
    product.images.forEach((img) => idsToDelete.push(img.cloudinary_id));
    product.variants.forEach((variant) => {
      if (variant.image && variant.image.cloudinary_id) {
        idsToDelete.push(variant.image.cloudinary_id);
      }
    });

    if (idsToDelete.length > 0) {
      await cloudinary.api.delete_resources(idsToDelete);
    }

    await product.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, msg: "Lỗi server", error: error.message });
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, msg: "Không tìm thấy sản phẩm" });
    }

    const { variants, deleted_cloudinary_ids } = req.body;
    const files = req.files; // Mảng file từ upload.any()

    // 1. Xóa ảnh cũ trên Cloudinary
    if (deleted_cloudinary_ids) {
      const idsToDelete = deleted_cloudinary_ids.split(",").filter((id) => id);
      if (idsToDelete.length > 0) {
        await cloudinary.api.delete_resources(idsToDelete);
      }
    }

    // 2. Tải ảnh mới lên Cloudinary
    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder:
          file.fieldname === "new_main_images"
            ? "products/general"
            : "products/variants",
      })
    );
    const uploadResults = await Promise.all(uploadPromises);

    const uploadedFilesMap = {};
    files.forEach((file, index) => {
      if (!uploadedFilesMap[file.fieldname]) {
        uploadedFilesMap[file.fieldname] = [];
      }
      uploadedFilesMap[file.fieldname].push(uploadResults[index]);
    });

    // 3. Chuẩn bị dữ liệu cập nhật
    const updateData = { ...req.body };

    // 4. Cập nhật ảnh chung
    let currentMainImages = product.images.filter(
      (img) =>
        !deleted_cloudinary_ids ||
        !deleted_cloudinary_ids.split(",").includes(img.cloudinary_id)
    );
    if (uploadedFilesMap["new_main_images"]) {
      uploadedFilesMap["new_main_images"].forEach((result) => {
        currentMainImages.push({
          url: result.secure_url,
          cloudinary_id: result.public_id,
        });
      });
    }
    updateData.images = currentMainImages;

    // 5. Cập nhật variants
    if (variants) {
      let parsedVariants = JSON.parse(variants);
      const finalVariants = parsedVariants.map((variant) => {
        const identifier = variant.imageIdentifier;
        if (
          identifier &&
          uploadedFilesMap[identifier] &&
          uploadedFilesMap[identifier][0]
        ) {
          const result = uploadedFilesMap[identifier][0];
          variant.image = {
            url: result.secure_url,
            cloudinary_id: result.public_id,
          };
        }
        delete variant.imageIdentifier;
        return variant;
      });
      updateData.variants = finalVariants;
    }

    // 6. Cập nhật sản phẩm
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    if (req.files) {
      // Dọn dẹp file tạm nếu có lỗi
      const allFiles = [
        ...(req.files.new_main_images || []),
        ...(req.files.new_variant_images || []),
      ];
      allFiles.forEach((file) =>
        require("fs").unlink(file.path, (err) => {
          if (err) console.error(err);
        })
      );
    }
    if (error.code === 11000)
      return res
        .status(400)
        .json({ success: false, msg: "Tên sản phẩm đã tồn tại" });
    console.error(error);
    res
      .status(500)
      .json({ success: false, msg: "Lỗi server", error: error.message });
  }
};

// @desc    Xóa TẤT CẢ các sản phẩm
// @route   DELETE /api/v1/products
// @access  Private/Admin
exports.deleteAllProducts = async (req, res, next) => {
  try {
    // 1. Tìm tất cả các sản phẩm để thu thập ID ảnh
    const products = await Product.find({});

    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        msg: "Không có sản phẩm nào để xóa.",
      });
    }

    // 2. Thu thập tất cả cloudinary_id từ tất cả sản phẩm
    const allCloudinaryIds = [];
    products.forEach((product) => {
      // Lấy ID từ ảnh chung
      if (product.images && product.images.length > 0) {
        product.images.forEach((img) => {
          if (img.cloudinary_id) {
            allCloudinaryIds.push(img.cloudinary_id);
          }
        });
      }
      // Lấy ID từ ảnh của các biến thể
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant) => {
          if (variant.image && variant.image.cloudinary_id) {
            allCloudinaryIds.push(variant.image.cloudinary_id);
          }
        });
      }
    });

    // 3. Xóa tất cả ảnh trên Cloudinary (nếu có)
    // Cloudinary API cho phép xóa tối đa 100 ID mỗi lần gọi.
    // Nếu bạn có nhiều hơn, bạn cần chia nhỏ ra.
    if (allCloudinaryIds.length > 0) {
      // Chia mảng ID thành các chunk nhỏ hơn 100
      const chunkSize = 100;
      for (let i = 0; i < allCloudinaryIds.length; i += chunkSize) {
        const chunk = allCloudinaryIds.slice(i, i + chunkSize);
        await cloudinary.api.delete_resources(chunk);
      }
    }

    // 4. Xóa tất cả sản phẩm khỏi database
    const result = await Product.deleteMany({});

    res.status(200).json({
      success: true,
      msg: `Đã xóa thành công ${result.deletedCount} sản phẩm và các ảnh liên quan.`,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, msg: "Lỗi server", error: error.message });
  }
};

exports.addComment = async (req, res, next) => {};
