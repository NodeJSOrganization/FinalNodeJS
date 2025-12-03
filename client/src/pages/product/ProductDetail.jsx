// import { useState, useEffect, useMemo } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { FaShoppingCart } from "react-icons/fa";
// import {
//   Container,
//   Row,
//   Col,
//   Button,
//   Card,
//   Carousel,
//   Spinner,
//   Alert,
// } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import axios from "axios";
// import io from "socket.io-client";

// import {
//   getProductStart,
//   getProductSuccess,
//   getProductFailure,
//   clearSelectedProduct,
// } from "../../../features/product/productReducer";
// import {
//   setCartItems,
//   toggleAllItems,
// } from "../../../features/cart/cartReducer";
// import { addItem, toggleItem } from "../../../features/cart/cartReducer";

// import ProductReviews from "../../components/product/ProductReviews";
// import RelatedProducts from "../../components/product/RelatedProduct";

// // Helper định dạng tiền tệ
// const currencyFormat = (v) => {
//   return Number(v || 0).toLocaleString("vi-VN");
// };

// const VariantStyles = () => (
//   <style>{`
//     .option-group-label { font-weight: bold; margin-bottom: 0.5rem; text-transform: uppercase; font-size: 0.9rem; color: #555; }
//     .variant-options-container { display: flex; flex-wrap: wrap; gap: 10px; }
//     .variant-btn { display: flex; align-items: center; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 8px 12px; cursor: pointer; transition: all 0.2s ease-in-out; text-align: left; position: relative; }
//     .variant-btn:hover { border-color: #0d6efd; }
//     .variant-btn.active { border-color: #dc3545; border-width: 2px; background-color: #fff; box-shadow: 0 0 8px rgba(220, 53, 69, 0.3); }
//     .variant-btn.active::after { content: '✔'; position: absolute; top: -8px; right: -8px; background-color: #dc3545; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; }
//     .variant-color-img { width: 24px; height: 24px; margin-right: 8px; border-radius: 4px; border: 1px solid #eee; object-fit: cover; }
//     .price-box { background-color: #f8f9fa; border-radius: 8px; }
//     .main-price { font-size: 2rem; font-weight: bold; color: #dc3545; }
//     .original-price { font-size: 1.2rem; color: #6c757d; text-decoration: line-through; }
//     .thumbnails-container { display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap; justify-content: center; }
//     .thumbnail-img { width: 60px; height: 60px; object-fit: cover; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; transition: border-color 0.2s; }
//     .thumbnail-img:hover { border-color: #aaa; }
//     .thumbnail-img.active { border-color: #0d6efd; }
//   `}</style>
// );

// const ProductDetail = () => {
//   const dispatch = useDispatch();
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const {
//     selectedProduct,
//     isLoading,
//     error,
//     products: allProducts,
//   } = useSelector((state) => state.product);
//   const { user, token } = useSelector((state) => state.auth);
//   const { cartItems } = useSelector((state) => state.cart);

//   const [selectedOptions, setSelectedOptions] = useState({});
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [reviews, setReviews] = useState([]);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       if (!id) return;
//       dispatch(getProductStart());
//       try {
//         // API call sẽ trả về sản phẩm đã được tính toán giá khuyến mãi
//         const { data } = await axios.get(`/api/v1/products/${id}`);
//         dispatch(getProductSuccess(data.data));
//       } catch (err) {
//         const errorMessage =
//           err.response?.data?.msg || "Không thể tải sản phẩm.";
//         dispatch(getProductFailure(errorMessage));
//       }
//     };
//     fetchProduct();
//     return () => {
//       dispatch(clearSelectedProduct());
//     };
//   }, [id, dispatch]);

//   useEffect(() => {
//     if (selectedProduct && selectedProduct.variants.length > 0) {
//       setSelectedOptions({
//         color: selectedProduct.variants[0].color,
//         performance: selectedProduct.variants[0].performance,
//       });
//       setActiveIndex(0);
//     }
//   }, [selectedProduct]);

//   useEffect(() => {
//     if (!id) return;

//     const socket = io("http://localhost:5000");
//     socket.on("connect", () => socket.emit("joinProductRoom", id));
//     socket.on("newReview", (newReviewData) =>
//       setReviews((prev) => [newReviewData, ...prev])
//     );
//     socket.on("reviewUpdated", (updatedReviewData) => {
//       setReviews((prev) =>
//         prev.map((r) =>
//           r._id === updatedReviewData._id ? updatedReviewData : r
//         )
//       );
//     });

//     const fetchReviews = async () => {
//       try {
//         const { data } = await axios.get(`/api/v1/reviews/product/${id}`);
//         setReviews(data.data || []);
//       } catch (error) {
//         console.error("Lỗi khi lấy danh sách reviews:", error);
//       }
//     };
//     fetchReviews();

//     return () => {
//       socket.disconnect();
//     };
//   }, [id]);

//   const availableOptions = useMemo(() => {
//     if (!selectedProduct) return { color: [], performance: [] };
//     const options = { color: new Set(), performance: new Set() };
//     selectedProduct.variants.forEach((variant) => {
//       options.color.add(variant.color);
//       options.performance.add(variant.performance);
//     });
//     return {
//       color: Array.from(options.color),
//       performance: Array.from(options.performance),
//     };
//   }, [selectedProduct]);

//   const currentVariant = useMemo(() => {
//     if (
//       !selectedProduct ||
//       !selectedOptions.color ||
//       !selectedOptions.performance
//     ) {
//       return null;
//     }
//     return selectedProduct.variants.find(
//       (variant) =>
//         variant.color === selectedOptions.color &&
//         variant.performance === selectedOptions.performance
//     );
//   }, [selectedProduct, selectedOptions]);

//   const allImages = useMemo(() => {
//     if (!selectedProduct) return [];
//     const mainImages = selectedProduct.images.map((img) => img.url);
//     const variantImages = selectedProduct.variants
//       .map((v) => v.image?.url)
//       .filter(Boolean);
//     return [...new Set([...mainImages, ...variantImages])];
//   }, [selectedProduct]);

//   const relatedProducts = useMemo(() => {
//     if (!selectedProduct || !allProducts || allProducts.length === 0) return [];
//     return allProducts.filter(
//       (p) =>
//         p.brand?._id === selectedProduct.brand?._id &&
//         p._id !== selectedProduct._id
//     );
//   }, [selectedProduct, allProducts]);

//   const handleOptionSelect = (optionKey, value) => {
//     const newVariant = selectedProduct.variants.find(
//       (variant) => variant[optionKey] === value
//     );

//     if (newVariant) {
//       setSelectedOptions({
//         color: newVariant.color,
//         performance: newVariant.performance,
//       });
//     }
//   };

//   const handleAddComment = async (reviewData) => {
//     try {
//       const config = { headers: { "Content-Type": "application/json" } };
//       if (token) {
//         config.headers["Authorization"] = `Bearer ${token}`;
//       }
//       await axios.post(`/api/v1/reviews/product/${id}`, reviewData, config);
//     } catch (error) {
//       console.error("Lỗi khi thêm review:", error);
//       throw error;
//     }
//   };

//   const { originalPrice, finalPrice, isDiscounted } = useMemo(() => {
//     const originalPriceCalc = currentVariant?.sellingPrice || 0;
//     // Sử dụng giá finalPrice được tính toán từ backend, nếu không có thì dùng giá gốc
//     const finalPriceCalc = selectedProduct?.finalPrice || originalPriceCalc;

//     return {
//       originalPrice: originalPriceCalc,
//       finalPrice: finalPriceCalc,
//       isDiscounted: finalPriceCalc < originalPriceCalc,
//     };
//   }, [selectedProduct, currentVariant]);

//   const createItemData = () => {
//     if (!currentVariant || !finalPrice) return null; // Dùng finalPrice đã tính

//     return {
//       // Dữ liệu cần cho API (nếu đã đăng nhập)
//       productId: selectedProduct._id,
//       variantId: currentVariant._id,
//       quantity: 1,

//       // Dữ liệu đầy đủ cần cho localStorage (nếu là khách)
//       variantSnapshot: {
//         _id: currentVariant._id,
//         name: selectedProduct.name,
//         variantName: `${currentVariant.color} - ${currentVariant.performance}`,
//         image: currentVariant.image?.url,
//         price: finalPrice, // <-- SỬ DỤNG GIÁ CUỐI CÙNG (ĐÃ GIẢM) TỪ useMemo
//         sku: currentVariant.sku,
//       },
//       productSnapshot: {
//         _id: selectedProduct._id,
//         name: selectedProduct.name,
//         images: selectedProduct.images,
//       },
//     };
//   };

//   const handleAddVariantToCart = () => {
//     const itemData = createItemData(); // Gọi hàm helper
//     if (!itemData) {
//       alert("Vui lòng chọn đầy đủ cấu hình sản phẩm.");
//       return;
//     }

//     dispatch(addItem(itemData))
//       .unwrap()
//       .then(() => {
//         alert(`Đã thêm vào giỏ hàng!`);
//       })
//       .catch((errorMsg) => {
//         alert(`Lỗi: ${errorMsg}`);
//       });
//   };

//   const handleBuyNow = () => {
//     const itemData = createItemData();
//     if (!itemData) {
//       alert("Vui lòng chọn đầy đủ cấu hình sản phẩm.");
//       return;
//     }

//     dispatch(addItem(itemData))
//       .unwrap()
//       .then(() => {
//         navigate("/cart", { state: { checkoutVariantId: currentVariant._id } });
//       })
//       .catch((errorMsg) => {
//         alert(`Lỗi: ${errorMsg}`);
//       });
//   };

//   const getColorImage = (color) => {
//     const variantWithColor = selectedProduct.variants.find(
//       (v) => v.color === color
//     );
//     return variantWithColor ? variantWithColor.image.url : "";
//   };

//   if (isLoading) {
//     return (
//       <Container
//         className="d-flex justify-content-center align-items-center"
//         style={{ minHeight: "80vh" }}
//       >
//         <Spinner animation="border" role="status" variant="primary">
//           <span className="visually-hidden">Đang tải...</span>
//         </Spinner>
//         <p className="ms-3 mb-0">Đang tải sản phẩm...</p>
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container className="py-5">
//         <Alert variant="danger">Lỗi: {error}</Alert>
//       </Container>
//     );
//   }

//   if (!selectedProduct || !currentVariant) {
//     return (
//       <Container
//         className="d-flex justify-content-center align-items-center"
//         style={{ minHeight: "80vh" }}
//       >
//         <Spinner animation="border" variant="secondary" />
//       </Container>
//     );
//   }

//   return (
//     <>
//       <VariantStyles />
//       <Container className="py-4">
//         <Row>
//           <Col md={6}>
//             <Card className="border-0 shadow-sm mb-3">
//               <Carousel
//                 activeIndex={activeIndex}
//                 onSelect={(idx) => setActiveIndex(idx)}
//                 interval={null}
//               >
//                 {allImages.map((img, idx) => (
//                   <Carousel.Item key={`${img}-${idx}`}>
//                     <img
//                       className="d-block w-100"
//                       src={img}
//                       alt={`Hình ảnh sản phẩm ${idx + 1}`}
//                       style={{ aspectRatio: "1/1", objectFit: "contain" }}
//                     />
//                   </Carousel.Item>
//                 ))}
//               </Carousel>
//             </Card>
//             <div className="thumbnails-container">
//               {allImages.map((img, idx) => (
//                 <img
//                   key={`${img}-thumb-${idx}`}
//                   src={img}
//                   alt={`Thumbnail ${idx + 1}`}
//                   className={`thumbnail-img ${
//                     activeIndex === idx ? "active" : ""
//                   }`}
//                   onClick={() => setActiveIndex(idx)}
//                 />
//               ))}
//             </div>
//           </Col>

//           <Col md={6}>
//             <h2>{selectedProduct.name}</h2>
//             <p className="text-muted">{currentVariant.performance}</p>

//             {/* LOGIC HIỂN THỊ GIÁ CẬP NHẬT */}
//             <div className="price-box p-3 my-3">
//               {/* Giá cuối cùng (Luôn hiển thị) */}
//               <span className="main-price">{currencyFormat(finalPrice)}₫</span>

//               {/* Giá gốc bị gạch ngang (Chỉ hiển thị khi có khuyến mãi) */}
//               {isDiscounted && (
//                 <span className="original-price ms-2">
//                   {currencyFormat(originalPrice)}₫
//                 </span>
//               )}
//             </div>
//             {/* KẾT THÚC LOGIC HIỂN THỊ GIÁ */}

//             <div className="border p-3 rounded">
//               <h5 className="mb-3">Lựa chọn cấu hình</h5>
//               {Object.entries(availableOptions).map(([key, values]) => (
//                 <div key={key} className="mb-3">
//                   <div className="option-group-label">
//                     {key === "color" ? "Màu sắc" : "Cấu hình"}
//                   </div>
//                   <div className="variant-options-container">
//                     {values.map((value) => (
//                       <button
//                         key={value}
//                         className={`variant-btn ${
//                           selectedOptions[key] === value ? "active" : ""
//                         }`}
//                         onClick={() => handleOptionSelect(key, value)}
//                       >
//                         {key === "color" && (
//                           <img
//                             src={getColorImage(value)}
//                             alt={value}
//                             className="variant-color-img"
//                           />
//                         )}
//                         <span>{value}</span>
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <p className="mt-3">
//               <strong>Mô tả:</strong>
//             </p>
//             <p style={{ whiteSpace: "pre-wrap" }}>
//               {selectedProduct.description}
//             </p>
//             <div className="d-flex gap-3 mt-3">
//               <Button
//                 variant="outline-primary"
//                 size="lg"
//                 className="w-100 py-3"
//                 onClick={handleAddVariantToCart}
//                 disabled={currentVariant.quantity === 0}
//               >
//                 <FaShoppingCart className="me-2" />
//                 {currentVariant.quantity > 0 ? "Thêm vào giỏ" : "Hết hàng"}
//               </Button>
//               <Button
//                 variant="danger"
//                 size="lg"
//                 className="w-100 py-3"
//                 onClick={handleBuyNow}
//                 disabled={currentVariant.quantity === 0}
//               >
//                 Mua ngay
//               </Button>
//             </div>
//           </Col>
//         </Row>

//         <RelatedProducts products={relatedProducts} />

//         <ProductReviews
//           reviews={reviews}
//           productName={selectedProduct.name}
//           onAddReview={handleAddComment}
//           user={user}
//         />
//       </Container>
//     </>
//   );
// };

// export default ProductDetail;

// pages/ProductDetail.js (Hoàn chỉnh)

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Carousel,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import io from "socket.io-client";

import {
  getProductStart,
  getProductSuccess,
  getProductFailure,
  clearSelectedProduct,
} from "../../../features/product/productReducer";
import { addItem } from "../../../features/cart/cartReducer";

import ProductReviews from "../../components/product/ProductReviews";
import RelatedProducts from "../../components/product/RelatedProduct";

// Helper định dạng tiền tệ
const currencyFormat = (v) => {
  return Number(v || 0).toLocaleString("vi-VN");
};

const VariantStyles = () => (
  <style>{`
    .option-group-label { font-weight: bold; margin-bottom: 0.5rem; text-transform: uppercase; font-size: 0.9rem; color: #555; }
    .variant-options-container { display: flex; flex-wrap: wrap; gap: 10px; }
    .variant-btn { display: flex; align-items: center; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 8px 12px; cursor: pointer; transition: all 0.2s ease-in-out; text-align: left; position: relative; }
    .variant-btn:hover { border-color: #0d6efd; }
    .variant-btn.active { border-color: #dc3545; border-width: 2px; background-color: #fff; box-shadow: 0 0 8px rgba(220, 53, 69, 0.3); }
    .variant-btn.active::after { content: '✔'; position: absolute; top: -8px; right: -8px; background-color: #dc3545; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; }
    .variant-color-img { width: 24px; height: 24px; margin-right: 8px; border-radius: 4px; border: 1px solid #eee; object-fit: cover; }
    .price-box { background-color: #f8f9fa; border-radius: 8px; }
    .main-price { font-size: 2rem; font-weight: bold; color: #dc3545; }
    .original-price { font-size: 1.2rem; color: #6c757d; text-decoration: line-through; }
    .thumbnails-container { display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap; justify-content: center; }
    .thumbnail-img { width: 60px; height: 60px; object-fit: cover; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; transition: border-color 0.2s; }
    .thumbnail-img:hover { border-color: #aaa; }
    .thumbnail-img.active { border-color: #0d6efd; }
  `}</style>
);

const ProductDetail = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    selectedProduct,
    isLoading,
    error,
    products: allProducts,
  } = useSelector((state) => state.product);
  const { user, token } = useSelector((state) => state.auth);
  // cartItems không cần thiết ở đây, loại bỏ để clean code

  const [selectedOptions, setSelectedOptions] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      dispatch(getProductStart());
      try {
        // API call sẽ trả về sản phẩm đã được tính toán giá khuyến mãi
        const { data } = await axios.get(`/api/v1/products/${id}`);
        dispatch(getProductSuccess(data.data));
      } catch (err) {
        const errorMessage =
          err.response?.data?.msg || "Không thể tải sản phẩm.";
        dispatch(getProductFailure(errorMessage));
      }
    };
    fetchProduct();
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (selectedProduct && selectedProduct.variants.length > 0) {
      setSelectedOptions({
        color: selectedProduct.variants[0].color,
        performance: selectedProduct.variants[0].performance,
      });
      setActiveIndex(0);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (!id) return;

    const socket = io("http://localhost:5000");
    socket.on("connect", () => socket.emit("joinProductRoom", id));
    socket.on("newReview", (newReviewData) =>
      setReviews((prev) => [newReviewData, ...prev])
    );
    socket.on("reviewUpdated", (updatedReviewData) => {
      setReviews((prev) =>
        prev.map((r) =>
          r._id === updatedReviewData._id ? updatedReviewData : r
        )
      );
    });

    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`/api/v1/reviews/product/${id}`);
        setReviews(data.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách reviews:", error);
      }
    };
    fetchReviews();

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const availableOptions = useMemo(() => {
    if (!selectedProduct) return { color: [], performance: [] };
    const options = { color: new Set(), performance: new Set() };
    selectedProduct.variants.forEach((variant) => {
      options.color.add(variant.color);
      options.performance.add(variant.performance);
    });
    return {
      color: Array.from(options.color),
      performance: Array.from(options.performance),
    };
  }, [selectedProduct]);

  const currentVariant = useMemo(() => {
    if (
      !selectedProduct ||
      !selectedOptions.color ||
      !selectedOptions.performance
    ) {
      return null;
    }
    // Logic tìm biến thể đang chọn (giữ nguyên)
    return selectedProduct.variants.find(
      (variant) =>
        variant.color === selectedOptions.color &&
        variant.performance === selectedOptions.performance
    );
  }, [selectedProduct, selectedOptions]);

  const allImages = useMemo(() => {
    if (!selectedProduct) return [];
    const mainImages = selectedProduct.images.map((img) => img.url);
    const variantImages = selectedProduct.variants
      .map((v) => v.image?.url)
      .filter(Boolean);
    return [...new Set([...mainImages, ...variantImages])];
  }, [selectedProduct]);

  const relatedProducts = useMemo(() => {
    if (!selectedProduct || !allProducts || allProducts.length === 0) return [];
    return allProducts.filter(
      (p) =>
        p.brand?._id === selectedProduct.brand?._id &&
        p._id !== selectedProduct._id
    );
  }, [selectedProduct, allProducts]);

  const handleOptionSelect = (optionKey, value) => {
    const newVariant = selectedProduct.variants.find(
      (variant) => variant[optionKey] === value
    );

    if (newVariant) {
      setSelectedOptions({
        color: newVariant.color,
        performance: newVariant.performance,
      });
    }
  };

  const handleAddComment = async (reviewData) => {
    try {
      const config = { headers: { "Content-Type": "application/json" } };
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      await axios.post(`/api/v1/reviews/product/${id}`, reviewData, config);
    } catch (error) {
      console.error("Lỗi khi thêm review:", error);
      throw error;
    }
  };

  // ************* FIX 1: TÍNH TOÁN GIÁ CỐ ĐỊNH (USEMEMO) **************
  const { originalPrice, finalPrice, isDiscounted } = useMemo(() => {
    if (!currentVariant) {
      return { originalPrice: 0, finalPrice: 0, isDiscounted: false };
    }

    // LẤY GIÁ ĐƯỢC GÁN TỪ BACKEND TRONG VARIANT OBJECT
    // currentVariant.originalPrice và currentVariant.finalPrice đã được Backend tính toán
    const originalPriceCalc =
      currentVariant.originalPrice || currentVariant.sellingPrice || 0;
    const finalPriceCalc = currentVariant.finalPrice || originalPriceCalc;

    return {
      originalPrice: originalPriceCalc,
      finalPrice: finalPriceCalc,
      isDiscounted: finalPriceCalc < originalPriceCalc,
    };
  }, [currentVariant]);
  // *******************************************************************

  const createItemData = () => {
    if (!currentVariant || !finalPrice) return null; // Dùng finalPrice đã tính

    return {
      // Dữ liệu cần cho API (nếu đã đăng nhập)
      productId: selectedProduct._id,
      variantId: currentVariant._id,
      quantity: 1,

      // Dữ liệu đầy đủ cần cho localStorage (nếu là khách)
      variantSnapshot: {
        _id: currentVariant._id,
        name: selectedProduct.name,
        variantName: `${currentVariant.color} - ${currentVariant.performance}`,
        image: currentVariant.image?.url,
        price: finalPrice, // <-- SỬ DỤNG GIÁ CUỐI CÙNG (ĐÃ GIẢM) TỪ useMemo
        sku: currentVariant.sku,
      },
      productSnapshot: {
        _id: selectedProduct._id,
        name: selectedProduct.name,
        images: selectedProduct.images,
      },
    };
  };

  const handleAddVariantToCart = () => {
    const itemData = createItemData(); // Gọi hàm helper
    if (!itemData) {
      alert("Vui lòng chọn đầy đủ cấu hình sản phẩm.");
      return;
    }

    dispatch(addItem(itemData))
      .unwrap()
      .then(() => {
        alert(`Đã thêm vào giỏ hàng!`);
      })
      .catch((errorMsg) => {
        alert(`Lỗi: ${errorMsg}`);
      });
  };

  const handleBuyNow = () => {
    const itemData = createItemData();
    if (!itemData) {
      alert("Vui lòng chọn đầy đủ cấu hình sản phẩm.");
      return;
    }

    dispatch(addItem(itemData))
      .unwrap()
      .then(() => {
        navigate("/cart", { state: { checkoutVariantId: currentVariant._id } });
      })
      .catch((errorMsg) => {
        alert(`Lỗi: ${errorMsg}`);
      });
  };

  const getColorImage = (color) => {
    const variantWithColor = selectedProduct.variants.find(
      (v) => v.color === color
    );
    return variantWithColor ? variantWithColor.image.url : "";
  };

  if (isLoading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
        <p className="ms-3 mb-0">Đang tải sản phẩm...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Lỗi: {error}</Alert>
      </Container>
    );
  }

  if (!selectedProduct || !currentVariant) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner animation="border" variant="secondary" />
      </Container>
    );
  }

  return (
    <>
      <VariantStyles />
      <Container className="py-4">
        <Row>
          <Col md={6}>
            <Card className="border-0 shadow-sm mb-3">
              <Carousel
                activeIndex={activeIndex}
                onSelect={(idx) => setActiveIndex(idx)}
                interval={null}
              >
                {allImages.map((img, idx) => (
                  <Carousel.Item key={`${img}-${idx}`}>
                    <img
                      className="d-block w-100"
                      src={img}
                      alt={`Hình ảnh sản phẩm ${idx + 1}`}
                      style={{ aspectRatio: "1/1", objectFit: "contain" }}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            </Card>
            <div className="thumbnails-container">
              {allImages.map((img, idx) => (
                <img
                  key={`${img}-thumb-${idx}`}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`thumbnail-img ${
                    activeIndex === idx ? "active" : ""
                  }`}
                  onClick={() => setActiveIndex(idx)}
                />
              ))}
            </div>
          </Col>

          <Col md={6}>
            <h2>{selectedProduct.name}</h2>
            <p className="text-muted">{currentVariant.performance}</p>

            {/* LOGIC HIỂN THỊ GIÁ CẬP NHẬT */}
            <div className="price-box p-3 my-3">
              {/* Giá cuối cùng (Luôn hiển thị) */}
              <span className="main-price">{currencyFormat(finalPrice)}₫</span>

              {/* Giá gốc bị gạch ngang (Chỉ hiển thị khi có khuyến mãi) */}
              {isDiscounted && (
                <span className="original-price ms-2">
                  {currencyFormat(originalPrice)}₫
                </span>
              )}
            </div>
            {/* KẾT THÚC LOGIC HIỂN THỊ GIÁ */}

            <div className="border p-3 rounded">
              <h5 className="mb-3">Lựa chọn cấu hình</h5>
              {Object.entries(availableOptions).map(([key, values]) => (
                <div key={key} className="mb-3">
                  <div className="option-group-label">
                    {key === "color" ? "Màu sắc" : "Cấu hình"}
                  </div>
                  <div className="variant-options-container">
                    {values.map((value) => (
                      <button
                        key={value}
                        className={`variant-btn ${
                          selectedOptions[key] === value ? "active" : ""
                        }`}
                        onClick={() => handleOptionSelect(key, value)}
                      >
                        {key === "color" && (
                          <img
                            src={getColorImage(value)}
                            alt={value}
                            className="variant-color-img"
                          />
                        )}
                        <span>{value}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3">
              <strong>Mô tả:</strong>
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>
              {selectedProduct.description}
            </p>
            <div className="d-flex gap-3 mt-3">
              <Button
                variant="outline-primary"
                size="lg"
                className="w-100 py-3"
                onClick={handleAddVariantToCart}
                disabled={currentVariant.quantity === 0}
              >
                <FaShoppingCart className="me-2" />
                {currentVariant.quantity > 0 ? "Thêm vào giỏ" : "Hết hàng"}
              </Button>
              <Button
                variant="danger"
                size="lg"
                className="w-100 py-3"
                onClick={handleBuyNow}
                disabled={currentVariant.quantity === 0}
              >
                Mua ngay
              </Button>
            </div>
          </Col>
        </Row>

        <RelatedProducts products={relatedProducts} />

        <ProductReviews
          reviews={reviews}
          productName={selectedProduct.name}
          onAddReview={handleAddComment}
          user={user}
        />
      </Container>
    </>
  );
};

export default ProductDetail;
