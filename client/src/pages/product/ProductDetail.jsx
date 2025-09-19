import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductSampleData } from "../../data/ProductSampleData";
import { FaShoppingCart } from "react-icons/fa";
import { Container, Row, Col, Button, Card, Carousel } from "react-bootstrap";
import { setCartItems } from "../../../features/cart/cartReducer";
import { useDispatch, useSelector } from "react-redux";
import ProductReviews from "../../components/product/ProductReviews";
import RelatedProducts from "../../components/product/RelatedProduct";

// CSS Styles cho component
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
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const allProducts = useSelector((state) =>
    Object.values(state.product.products).flat()
  );

  const [product, setProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [comments, setComments] = useState([
    {
      id: 1,
      user: "A Quốc",
      rating: 5,
      comment: "Tuyệt vời, máy chạy mượt, pin trâu!",
    },
    {
      id: 2,
      user: "B Văn",
      rating: 5,
      comment: "Thiết kế đẹp, mỏng nhẹ, đáng tiền.",
    },
  ]);

  useEffect(() => {
    const allProducts = Object.values(ProductSampleData).flat();
    const foundProduct = allProducts.find((p) => p.id === id);

    if (foundProduct && foundProduct.variants.length > 0) {
      setProduct(foundProduct);
      setSelectedOptions({
        color: foundProduct.variants[0].color,
        performance: foundProduct.variants[0].performance,
      });
      setActiveIndex(0);
    }
  }, [id]);

  const availableOptions = useMemo(() => {
    if (!product) return {};
    const options = { color: new Set(), performance: new Set() };
    product.variants.forEach((variant) => {
      options.color.add(variant.color);
      options.performance.add(variant.performance);
    });
    return {
      color: Array.from(options.color),
      performance: Array.from(options.performance),
    };
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product || allProducts.length === 0) return [];

    return allProducts.filter(
      (p) => p.brand === product.brand && p.id !== product.id
    );
  }, [product, allProducts]);

  const handleOptionSelect = (optionKey, value) => {
    const newVariant = product.variants.find(
      (variant) => variant[optionKey] === value
    );

    if (newVariant) {
      setSelectedOptions({
        color: newVariant.color,
        performance: newVariant.performance,
      });
    }
  };

  const currentVariant = useMemo(() => {
    if (!product || Object.keys(selectedOptions).length === 0) return null;

    return product.variants.find(
      (variant) =>
        variant.color === selectedOptions.color &&
        variant.performance === selectedOptions.performance
    );
  }, [product, selectedOptions]);

  const allImages = useMemo(() => {
    if (!product) return [];
    const variantImages = product.variants.map((v) => v.image);
    return [...new Set([...product.images, ...variantImages])];
  }, [product]);

  const handleAddVariantToCart = () => {
    if (!currentVariant) return;

    const cartItemToAdd = {
      productId: product.id,
      variantId: currentVariant.id,
      name: product.name,
      image: currentVariant.image,
      variantName: `${currentVariant.color} - ${currentVariant.performance}`,
      price: currentVariant.sellingPrice,
      quantity: 1,
      checked: false,
    };

    const existingItem = cartItems.find(
      (item) => item.variantId === cartItemToAdd.variantId
    );

    console.log("existingItem", existingItem);
    const updatedCartItems = existingItem
      ? cartItems.map((item) =>
          item.variantId === existingItem.variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...cartItems, cartItemToAdd];
    dispatch(setCartItems(updatedCartItems));
    alert(
      `Đã thêm "${cartItemToAdd.name} - ${cartItemToAdd.variantName}" vào giỏ hàng!`
    );
  };

  const handleBuyNow = () => {
    if (!currentVariant) return;
    const cartItemToAdd = {
      productId: product.id,
      variantId: currentVariant.id,
      name: product.name,
      image: currentVariant.image,
      variantName: `${currentVariant.color} - ${currentVariant.performance}`,
      price: currentVariant.sellingPrice,
      quantity: 1,
      checked: true,
    };
    const otherItems = cartItems.map((item) => ({ ...item, checked: false }));
    const existingItemIndex = otherItems.findIndex(
      (item) => item.variantId === cartItemToAdd.variantId
    );
    let updatedCartItems;
    if (existingItemIndex !== -1) {
      updatedCartItems = otherItems.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + 1, checked: true }
          : item
      );
    } else {
      updatedCartItems = [...otherItems, cartItemToAdd];
    }
    dispatch(setCartItems(updatedCartItems));
    navigate("/cart");
  };

  const handleAddComment = (newReview) => {
    setComments((prevComments) => [newReview, ...prevComments]);
  };

  const getColorImage = (color) => {
    const variantWithColor = product.variants.find((v) => v.color === color);
    return variantWithColor ? variantWithColor.image : "";
  };

  if (!product || !currentVariant) {
    return (
      <Container className="py-4 text-center">Đang tải sản phẩm...</Container>
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
                  <Carousel.Item key={idx}>
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
                  key={idx}
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
            <h2>{product.name}</h2>
            <p className="text-muted">{currentVariant.performance}</p>
            <div className="price-box p-3 my-3">
              <span className="main-price">
                {currentVariant.sellingPrice.toLocaleString("vi-VN")}đ
              </span>
              <span className="original-price ms-2">
                {currentVariant.costPrice.toLocaleString("vi-VN")}đ
              </span>
            </div>
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
            <p>{product.description}</p>
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
          reviews={comments}
          productName={product.name}
          onAddReview={handleAddComment}
        />
      </Container>
    </>
  );
};

export default ProductDetail;
