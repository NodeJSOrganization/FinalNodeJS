import Slider from "react-slick";
import { Row, Col } from "react-bootstrap";

import ProductItem from "./ProductItem";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const RelatedProducts = ({ products }) => {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  if (!products || products.length === 0) {
    return null;
  }

  const shouldUseSlider = products.length >= settings.slidesToShow;

  return (
    <div
      className="my-5"
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "24px",
        border: "1px solid #e9ecef",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 style={{ color: "#0d6efd", fontWeight: "bold", margin: 0 }}>
          Sản phẩm tương tự
        </h3>
      </div>

      {shouldUseSlider ? (
        <Slider {...settings}>
          {products.map((p) => (
            <div key={p.id} className="p-2">
              <ProductItem product={p} />
            </div>
          ))}
        </Slider>
      ) : (
        <Row className="g-4">
          {products.map((p) => (
            <Col key={p.id} lg={3} md={4} sm={6} xs={12}>
              <ProductItem product={p} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default RelatedProducts;
