import { useNavigate } from "react-router-dom";

const currencyFormat = (v) => {
  return Number(v || 0).toLocaleString("vi-VN");
};

const getApplicableDiscount = (product, promotions) => {
  if (!product || !promotions || promotions.length === 0) return null;

  const productId = product._id.toString();

  const applicablePromotions = promotions.filter(
    (promo) =>
      promo.status === "active" &&
      new Date(promo.startDate) <= new Date() &&
      new Date(promo.endDate) >= new Date() &&
      promo.appliedProducts.some((p) => {
        const currentProductId =
          typeof p === "object" && p !== null && p._id
            ? p._id.toString()
            : p.toString();

        return currentProductId === productId;
      })
  );

  if (applicablePromotions.length === 0) return null;

  return applicablePromotions.reduce((best, current) => {
    if (current.type === "fixed_amount" && best.type === "percent")
      return current;
    if (current.type === "percent" && best.type === "fixed_amount") return best;

    // Nếu cùng loại, ưu tiên giá trị lớn hơn
    return current.value > best.value ? current : best;
  });
};

const ProductItem = ({ product, promotions = [] }) => {
  const navigate = useNavigate();

  const sellingPrice = product.variants[0]?.sellingPrice || 0;
  let finalPrice = sellingPrice;
  let discountTag = null;

  const discount = getApplicableDiscount(product, promotions);

  if (discount) {
    if (discount.type === "percent") {
      const reduction = sellingPrice * (discount.value / 100);
      finalPrice = sellingPrice - reduction;
      discountTag = `Giảm ${discount.value}%`;
    } else if (discount.type === "fixed_amount") {
      finalPrice = sellingPrice - discount.value;
      discountTag = `Giảm ${currencyFormat(discount.value)}₫`;
    }
    finalPrice = Math.max(0, finalPrice);
  }

  const handleMoveToProductDetail = () => {
    navigate(`/products/${product._id}`);
  };

  return (
    <div
      onClick={handleMoveToProductDetail}
      className="text-decoration-none"
      style={{ cursor: "pointer", height: "100%" }}
    >
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden h-100">
        {discountTag && (
          <span
            className="position-absolute top-0 end-0 badge text-white px-2 py-1"
            style={{
              backgroundColor: "#dc3545",
              zIndex: 10,
              transform: "rotate(-5deg) translate(-10%, 10%)",
            }}
          >
            {discountTag}
          </span>
        )}

        <img
          src={
            product.images && product.images.length > 0
              ? product.images[0].url
              : "placeholder.jpg"
          }
          className="card-img-top"
          alt={product.name}
          style={{
            height: "180px",
            objectFit: "cover",
            transition: "transform 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
        <div className="card-body p-3 d-flex flex-column bg-light">
          <span
            className="badge bg-primary  mb-2 px-3 py-2 fw-bold text-uppercase shadow-sm"
            style={{ alignSelf: "flex-start", letterSpacing: "0.5px" }}
          >
            {product.brand?.name || "Không rõ"}
          </span>

          <h5 className="card-title text-dark fw-bold">{product.name}</h5>

          <p
            className="card-text text-success fw-medium mb-2"
            style={{ margin: 0, fontSize: "1.1rem" }}
          >
            <span
              style={{
                fontWeight: "bold",
              }}
            >
              {currencyFormat(finalPrice)}₫
            </span>

            {discount && sellingPrice > finalPrice && (
              <span
                className="ms-2 text-muted"
                style={{
                  textDecoration: "line-through",
                  fontSize: "0.8em",
                  fontWeight: "normal",
                }}
              >
                {currencyFormat(sellingPrice)}₫
              </span>
            )}
          </p>

          {/* <p className="card-text text-success fw-medium mb-2">
            Giá từ:
            {product.variants && product.variants.length > 0
              ? `${product.variants[0].sellingPrice.toLocaleString("vi-VN")}đ`
              : "N/A"}
          </p> */}

          <p className="card-text text-muted small">
            {product.description.substring(0, 100)}
            {product.description.length > 100 ? "..." : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
