import { FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";

const ProductItem = ({ product }) => {
  return (
    <Link
      to={`/${product.category}/${product.id}`}
      className="text-decoration-none"
    >
      <div className="card  h-100 border-0 shadow-sm rounded-3 overflow-hidden">
        <img
          src={product.images[0]}
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
        <div className="card-body p-3 bg-light d-flex flex-column">
          <span
            className="badge bg-primary mb-2 px-3 py-2 fw-bold text-uppercase shadow-sm"
            style={{ alignSelf: "flex-start", letterSpacing: "0.5px" }}
          >
            {product.brand}
          </span>

          <h5 className="card-title text-dark fw-bold">{product.name}</h5>
          <p className="card-text text-success fw-medium mb-2">
            Giá:{" "}
            {product.variants && product.variants.length > 0
              ? product.variants[0].price
              : "N/A"}
          </p>
          <p className="card-text text-muted small">
            {product.description.substring(0, 100)}
            {product.description.length > 100 ? "..." : ""}
          </p>
          <button className="btn btn-primary w-100 mt-2 mt-auto">
            <FaShoppingCart className="me-2" /> Thêm vào giỏ
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductItem;
