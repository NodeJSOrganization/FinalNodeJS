import {
  Container,
  Row,
  Col,
  Button,
  Tabs,
  Tab,
  Alert,
  Image,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/images/logo_white_space.png";
import "../../styles/Home.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { ProductSampleData } from "../../data/ProductSampleData";
import { setProducts } from "../../../features/product/productReducer";
import BestSeller from "../../components/product/BestSellerSession";
import ProductItem from "../../components/product/ProductItem";
import PaymentOffersSection from "../../components/product/PaymentOffersSection";
import { paymentOffers } from "../../data/PaymentOffers";
import { studentOffers } from "../../data/StudentOfferData";
import { brandsData } from "../../data/Brands";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const allProductsFromSample = Object.entries(ProductSampleData).flatMap(
      ([category, items]) =>
        items.map((item) => ({
          ...item,
          category,
        }))
    );

    dispatch(setProducts(allProductsFromSample));
  }, [dispatch]);

  const allProducts = useSelector((state) => state.product.products);
  const bestSellers = allProducts.slice(2, 8);

  const currentTime = new Date("2025-09-06T13:31:00+07:00").getTime();
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

  const newProducts = allProducts
    .filter((product) => currentTime - product.createdAt < sevenDaysInMs)
    .slice(0, 6);

  const laptops = allProducts.filter(
    (product) => product.category === "laptops"
  );
  const monitors = allProducts.filter(
    (product) => product.category === "monitors"
  );
  const hardDrives = allProducts.filter(
    (product) => product.category === "hard-drives"
  );

  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory =
      activeTab === "all" || product.category === activeTab;
    return matchesCategory;
  });

  return (
    <Container fluid className="py-4 bg-light">
      {/* Phần banner */}
      <div className="bg-dark text-white text-center py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold mb-3">
                Upgrade Your Tech, Elevate Your Life
              </h1>
              <p className="lead mb-4">
                Discover the latest in Laptops, High-Performance Monitors, and
                Reliable Hard Drives. Unleash productivity and immerse yourself
                in stunning visuals.
              </p>
              <div className="d-grid gap-2 d-md-flex justify-content-md-center mb-4">
                <Button variant="primary" size="lg">
                  <Link
                    to="/laptops"
                    style={{
                      color: "white",
                      textDecoration: "none",
                    }}
                  >
                    Shop Laptops
                  </Link>
                </Button>

                <Button
                  as={Link}
                  to="/monitors"
                  variant="outline-light"
                  size="lg"
                >
                  Explore Monitors
                </Button>

                <Button
                  as={Link}
                  to="/hard-drives"
                  variant="outline-primary"
                  size="lg"
                >
                  Hard Drives
                </Button>
              </div>
            </Col>
            <Col md={6}>
              <Image
                src="https://cdn.prod.website-files.com/5f2b1efb0f881760ffdc5c96/65293ad388e7f519253c23b6_cuu_mexygabriel_design_banner-scaled.jpg"
                fluid
                rounded
              />
            </Col>
          </Row>
        </Container>
      </div>
      <Alert
        variant="info"
        className="text-center py-3 mb-4 "
        style={{
          background: "linear-gradient(90deg, #0056b3, #00aaff)",
          color: "white",
          fontWeight: "bold",
          border: "none",
        }}
      >
        <img
          src={Logo}
          alt="Logo"
          style={{
            width: "50px",
            height: "50px",
            marginRight: "15px",
            borderRadius: "26%",
          }}
        />
        <span>
          🔥 Flash Sale hôm nay - Giảm giá lên đến 50% cho tất cả sản phẩm! ⏳
          Hết hạn trong 24 giờ 🔥
        </span>
      </Alert>
      <BestSeller bestSellers={bestSellers} />
      <section className="mb-5">
        <h1 className="text-center text-primary mb-4 mt-5">Sản phẩm mới</h1>
        <Row className="row-cols-1 row-cols-md-3 row-cols-lg-5 g-4">
          {newProducts.map((product) => (
            <Col key={product.id}>
              <ProductItem product={product} />
            </Col>
          ))}
        </Row>
      </section>
      <Alert
        variant="info"
        className="text-center py-3 mb-4 position-relative overflow-hidden"
        style={{
          backgroundColor: "#4a90e2",
          color: "white",
          fontWeight: "bold",
          fontSize: "1.1rem",
        }}
      >
        <span className="animate-pulse">
          💻 LAPTOPS SIÊU MẠNH - GIẢM 50% CHO DÒNG GAMING! ⏳ HẾT HẠN ĐÊM NAY
        </span>
        <Button
          variant="light"
          size="sm"
          className="ms-3 animate-bounce"
          style={{ borderRadius: "20px", padding: "5px 15px" }}
          onClick={() => {
            navigate("/laptops");
          }}
        >
          Mua ngay
        </Button>
        <div
          className="position-absolute top-0 start-0 w-25 h-100"
          style={{
            background: "linear-gradient(to left, transparent, #4a90e2)",
            animation: "slide 4s infinite linear",
          }}
        />
      </Alert>
      <section className="mb-5">
        <h2 className="text-center text-primary mb-4">Laptops</h2>
        <Row className="row-cols-1 row-cols-md-3 row-cols-lg-5 g-4 flex-column flex-md-row">
          {laptops.map((product) => (
            <Col key={product.id} className="mb-4">
              <ProductItem product={product} />
            </Col>
          ))}
        </Row>
      </section>
      <Alert
        variant="info"
        className="text-center py-3 mb-4 position-relative overflow-hidden"
        style={{
          backgroundColor: "#ff6f61",
          color: "white",
          fontWeight: "bold",
          fontSize: "1.1rem",
        }}
      >
        <span className="animate-pulse">
          🎉 SIÊU ƯU ĐÃI MONITORS - GIẢM 40% CHO MÀN HÌNH 4K! ⏳ CHỈ CÒN 12 GIỜ
        </span>
        <Button
          variant="light"
          size="sm"
          className="ms-3 animate-bounce"
          style={{ borderRadius: "20px", padding: "5px 15px" }}
          onClick={() => {
            navigate("/monitors");
          }}
        >
          Mua ngay
        </Button>
        <div
          className="position-absolute top-0 end-0 w-25 h-100"
          style={{
            background: "linear-gradient(to right, transparent, #ff6f61)",
            animation: "slide 4s infinite linear",
          }}
        />
      </Alert>
      <section className="mb-5">
        <h2 className="text-center text-primary mb-4">Monitors</h2>
        <Row className="row-cols-1 row-cols-md-3 row-cols-lg-5 g-4 flex-column flex-md-row">
          {monitors.map((product) => (
            <Col key={product.id} className="mb-4">
              <ProductItem product={product} />
            </Col>
          ))}
        </Row>
      </section>
      <Alert
        variant="info"
        className="text-center py-3 mb-4 position-relative overflow-hidden"
        style={{
          backgroundColor: "#2ecc71",
          color: "white",
          fontWeight: "bold",
          fontSize: "1.1rem",
        }}
      >
        <span className="animate-pulse">
          💾 HARD DRIVES ƯU ĐÃI - TĂNG 1TB MIỄN PHÍ! ⏳ CHỈ TRONG 24 GIỜ
        </span>
        <Button
          variant="light"
          size="sm"
          className="ms-3 animate-bounce"
          style={{ borderRadius: "20px", padding: "5px 15px" }}
          onClick={() => {
            navigate("/hard-drives");
          }}
        >
          Mua ngay
        </Button>
        <div
          className="position-absolute top-0 end-0 w-25 h-100"
          style={{
            background: "linear-gradient(to right, transparent, #2ecc71)",
            animation: "slide 4s infinite linear",
          }}
        />
      </Alert>
      <section className="mb-5">
        <h2 className="text-center text-primary mb-4">Hard Drives</h2>
        <Row className="row-cols-1 row-cols-md-3 row-cols-lg-5 g-4 flex-column flex-md-row">
          {hardDrives.map((product) => (
            <Col key={product.id} className="mb-4">
              <ProductItem product={product} />
            </Col>
          ))}
        </Row>
      </section>
      <Tabs
        defaultActiveKey="all"
        id="categories-tab"
        className="mb-4 justify-content-center"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
      >
        <Tab eventKey="all" title="Tất cả"></Tab>
        <Tab eventKey="laptops" title="Laptops"></Tab>
        <Tab eventKey="monitors" title="Monitors"></Tab>
        <Tab eventKey="hard-drives" title="Hard Drives"></Tab>
      </Tabs>

      <section className="mb-5">
        <h2 className="text-center text-primary mb-4">
          {activeTab === "all"
            ? "Tất cả sản phẩm"
            : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        </h2>
        <Row className="row-cols-1 row-cols-md-3 row-cols-lg-5 g-4">
          {filteredProducts.map((product) => (
            <Col key={product.id}>
              <ProductItem product={product} />
            </Col>
          ))}
        </Row>
      </section>
      <PaymentOffersSection heading="ƯU ĐÃI THANH TOÁN" data={paymentOffers} />
      <PaymentOffersSection heading="ƯU ĐÃI SINH VIÊN" data={studentOffers} />
      <PaymentOffersSection
        heading="CHUYÊN TRANG THƯƠNG HIỆU"
        data={brandsData}
      />
    </Container>
  );
};

export default Home;
