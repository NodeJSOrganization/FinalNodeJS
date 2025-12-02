import { useNavigate } from "react-router-dom";

const ProductItem = ({ product }) => {
  const navigate = useNavigate();

  const handleMoveToProductDetail = () => {
    navigate(`/products/${product._id}`);
    // navigate(`/${product.category.name}/${product._id}`);
    //
  };

  return (
    <div
      onClick={handleMoveToProductDetail}
      className="text-decoration-none"
      style={{ cursor: "pointer", height: "100%" }}
    >
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden h-100">
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

          <p className="card-text text-success fw-medium mb-2">
            Giá từ:
            {product.variants && product.variants.length > 0
              ? `${product.variants[0].sellingPrice.toLocaleString("vi-VN")}đ`
              : "N/A"}
          </p>

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
