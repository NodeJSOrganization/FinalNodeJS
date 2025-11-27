import {
  Container,
  Row,
  Col,
  Button,
  Tabs,
  Tab,
  Alert,
  Image,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../../assets/images/logo_white_space.png";
import "../../styles/Home.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
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

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const allProducts = useSelector((state) => state.product.products);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          axios.get("/api/v1/products"),
          axios.get("/api/v1/categories"),
        ]);

        dispatch(setProducts(productsResponse.data.data));

        setCategories(
          categoriesResponse.data.data
            .filter((cat) => cat.status === "active")
            .slice(0, 3)
        );
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", err);
        setError("Không thể tải được dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, [dispatch]);

  const bestSellers = [];

  const filteredProductsByTab = useMemo(() => {
    if (activeTab === "all") return allProducts;
    return allProducts.filter(
      (product) => product.category?.name === activeTab
    );
  }, [allProducts, activeTab]);

  const newProducts = [...allProducts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  if (isLoading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner animation="border" variant="primary" />
        <p className="ms-3 mb-0">Đang tải dữ liệu...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 bg-light">
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
                    to="/Laptop"
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
                  to="/Màn hình"
                  variant="outline-light"
                  size="lg"
                >
                  Explore Monitors
                </Button>

                <Button as={Link} to="/Ram" variant="outline-primary" size="lg">
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
        <Row xs={2} md={3} lg={5} className="g-4">
          {newProducts.map((product) => (
            <Col key={product._id}>
              <ProductItem product={product} />
            </Col>
          ))}
        </Row>
      </section>

      {categories.map((category) => {
        const categoryProducts = allProducts
          .filter((p) => p.category?.name === category.name) // Lọc theo tên để dễ đọc
          .slice(0, 5);

        if (categoryProducts.length === 0) return null;

        let bgColor, buttonLink, flashMessage;

        if (category.name.toLowerCase().includes("laptop")) {
          bgColor = "#4a90e2";
          buttonLink = "/laptops";
          flashMessage =
            "💻 LAPTOPS SIÊU MẠNH - GIẢM 50% CHO DÒNG GAMING! ⏳ HẾT HẠN ĐÊM NAY";
        } else if (
          category.name.toLowerCase().includes("màn hình") ||
          category.name.toLowerCase().includes("monitor")
        ) {
          bgColor = "#ff6f61";
          buttonLink = "/monitors";
          flashMessage =
            "🎉 SIÊU ƯU ĐÃI MONITORS - GIẢM 40% CHO MÀN HÌNH 4K! ⏳ CHỈ CÒN 12 GIỜ";
        } else if (
          category.name.toLowerCase().includes("ram") ||
          category.name.toLowerCase().includes("hard drive")
        ) {
          bgColor = "#2ecc71";
          buttonLink = "/hard-drives";
          flashMessage =
            "💾 HARD DRIVES ƯU ĐÃI - TĂNG 1TB MIỄN PHÍ! ⏳ CHỈ TRONG 24 GIỜ";
        } else {
          bgColor = "#8e44ad";
          buttonLink = `/products/category/${category.name}`;
          flashMessage = `🌟 ƯU ĐÃI ĐẶC BIỆT DÀNH CHO ${category.name.toUpperCase()}! 🔥 MUA NGAY KẺO HẾT`;
        }

        return (
          <section key={category._id} className="mb-5">
            <Alert
              variant="info"
              className="text-center py-3 mb-4 position-relative overflow-hidden"
              style={{
                backgroundColor: bgColor, // Màu nền động
                color: "white",
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
            >
              <span className="animate-pulse">{flashMessage}</span>
              <Button
                variant="light"
                size="sm"
                className="ms-3 animate-bounce"
                style={{ borderRadius: "20px", padding: "5px 15px" }}
                onClick={() => {
                  navigate(buttonLink);
                }}
              >
                Mua ngay
              </Button>
              <div
                className="position-absolute top-0 end-0 w-25 h-100"
                style={{
                  background: `linear-gradient(to right, transparent, ${bgColor})`,
                  animation: "slide 4s infinite linear",
                }}
              />
            </Alert>

            <Row xs={1} md={3} lg={5} className="g-4">
              {categoryProducts.map((product) => (
                <Col key={product._id}>
                  <ProductItem product={product} />
                </Col>
              ))}
            </Row>
          </section>
        );
      })}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        id="categories-tab"
        className="mb-4 justify-content-center"
      >
        <Tab eventKey="all" title="Tất cả"></Tab>
        {categories.map((cat) => (
          <Tab key={cat._id} eventKey={cat.name} title={cat.name}></Tab>
        ))}
      </Tabs>

      <section className="mb-5">
        <h2 className="text-center text-primary mb-4">
          {activeTab === "all" ? "Tất cả sản phẩm" : activeTab}
        </h2>
        <Row xs={1} md={3} lg={5} className="g-4">
          {filteredProductsByTab.map((product) => (
            <Col key={product._id}>
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
