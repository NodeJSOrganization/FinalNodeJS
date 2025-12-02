import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";

const currencyFormat = (v) => {
  return Number(v || 0).toLocaleString("vi-VN");
};

const BestSeller = ({ bestSellers }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(bestSellers.length, 4),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  if (!bestSellers || bestSellers.length === 0) {
    return (
      <div
        className="text-center py-4 text-muted"
        style={{
          background: "linear-gradient(135deg, #4facfe, #00f2fe)",
          borderRadius: "12px",
          margin: "20px 0",
        }}
      >
        <p className="mb-0">
          Hiện chưa có sản phẩm bán chạy nhất nào được xác định.
        </p>
      </div>
    );
  }

  return (
    <div
      className="mb-2 position-relative"
      style={{
        background: "linear-gradient(135deg, #4facfe, #00f2fe)",
        borderRadius: "12px",
        padding: "16px",
        color: "#fff",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-3">
          <div
            style={{
              background: "#fff",
              color: "#D95319",
              padding: "6px 16px",
              borderRadius: "20px",
              fontWeight: "bold",
            }}
          >
            Best Seller
          </div>
        </div>
      </div>

      <Slider {...settings}>
        {bestSellers.map((p) => (
          <Link
            to={`/products/${p._id}`}
            key={p._id}
            style={{ padding: "0 8px", textDecoration: "none" }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "8px",
                padding: "12px",
                color: "#000",
                textAlign: "center",
                marginRight: "12px",
                height: "300px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div className="d-flex align-items-center justify-content-center">
                <img
                  src={p.images[0]?.url || p.variants[0]?.image?.url}
                  alt={p.name}
                  style={{
                    height: "140px",
                    objectFit: "contain",
                    marginBottom: "8px",
                  }}
                />
              </div>

              <h6 style={{ fontWeight: "bold" }}>{p.name}</h6>

              {/* Giá sản phẩm (Giá bán của biến thể đầu tiên) */}
              <p style={{ color: "green", fontWeight: "bold" }}>
                {currencyFormat(p.variants[0]?.sellingPrice)}₫
              </p>

              {/* Hiển thị thương hiệu nếu có */}
              <div className="small text-muted">
                {p.brand?.name || "Chưa rõ Brand"}
              </div>
            </div>
          </Link>
        ))}
      </Slider>

      {/* Các phần tử trang trí (Quà tặng) */}
      <span
        className="position-absolute fs-1"
        style={{
          top: "-20px",
          right: "-10px",
          transform: "translateX(50%) rotate(20deg) scale(1.2)",
        }}
      >
        🎁
      </span>

      <span
        className="position-absolute fs-1"
        style={{
          bottom: "-20px",
          left: "-40px",
          transform: "translateX(50%) rotate(20deg) scale(1.2)",
        }}
      >
        🎁
      </span>

      <div
        style={{
          textAlign: "center",
          marginTop: "10px",
          fontSize: "14px",
          opacity: 0.8,
        }}
      >
        Khám phá những sản phẩm bán chạy nhất, được khách hàng yêu thích nhất
        tuần qua!
      </div>
    </div>
  );
};

export default BestSeller;
