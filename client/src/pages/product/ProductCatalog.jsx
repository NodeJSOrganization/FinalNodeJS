import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaTh, FaList } from "react-icons/fa";
import {
  Container,
  ButtonGroup,
  Button,
  Row,
  Col,
  Pagination,
  Card,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setProducts } from "../../../features/product/productReducer";
import ProductItem from "../../components/product/ProductItem";
import axios from "axios";

const ProductCatalog = () => {
  const allProducts = useSelector((state) => state.product.products);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const categoryNameFromUrl = searchParams.get("categoryName") || "all";

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });

  useEffect(() => {
    const fetchCatalogData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          axios.get("/api/v1/products"),
          axios.get("/api/v1/categories"),
        ]);

        dispatch(setProducts(productsResponse.data.data));

        const dynamicCategories = categoriesResponse.data.data
          .filter((cat) => cat.status === "active")
          .map((cat) => ({ key: cat.name, label: cat.name }));

        setCategories([
          { key: "all", label: "Tất cả sản phẩm" },
          ...dynamicCategories,
        ]);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu catalog:", error);
        setError("Không thể tải dữ liệu sản phẩm và danh mục.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalogData();
  }, [dispatch]);

  useEffect(() => {
    setActiveFilter(categoryNameFromUrl);
  }, [categoryNameFromUrl]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, sortBy, searchTerm, selectedBrand, priceRange]);

  const uniqueBrands = useMemo(() => {
    const brandsMap = new Map();
    allProducts.forEach((product) => {
      if (product.brand && product.brand._id) {
        brandsMap.set(product.brand._id, product.brand.name);
      }
    });
    return Array.from(brandsMap.values());
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    if (activeFilter !== "all") {
      products = products.filter(
        (product) => product.category?.name === activeFilter
      );
    }

    if (searchTerm) {
      products = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBrand) {
      products = products.filter(
        (product) => product.brand?.name === selectedBrand
      );
    }

    products = products.filter((product) => {
      if (!product.variants || product.variants.length === 0) return false;

      const productPrice = product.variants[0].sellingPrice;

      const maxPrice =
        priceRange.max === Infinity ? Number.MAX_SAFE_INTEGER : priceRange.max;

      return productPrice >= priceRange.min && productPrice <= maxPrice;
    });

    switch (sortBy) {
      case "name-asc":
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        products.sort(
          (a, b) =>
            (a.variants[0]?.sellingPrice || 0) -
            (b.variants[0]?.sellingPrice || 0)
        );
        break;
      case "price-desc":
        products.sort(
          (a, b) =>
            (b.variants[0]?.sellingPrice || 0) -
            (a.variants[0]?.sellingPrice || 0)
        );
        break;
      default:
        break;
    }

    return products;
  }, [
    allProducts,
    activeFilter,
    searchTerm,
    selectedBrand,
    priceRange,
    sortBy,
  ]);

  const productsPerPage = 9;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const toggleView = () => setViewMode(viewMode === "grid" ? "list" : "grid");

  const handleFilterClick = (filterKey) => {
    if (filterKey === "all") {
      navigate("/products"); // /products
    } else {
      navigate(`/products?categoryName=${filterKey}`);
    }
  };

  const currentCategoryLabel =
    categories.find((f) => f.key === activeFilter)?.label || "Tất cả Sản phẩm";

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p>Đang tải dữ liệu...</p>
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
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="text-primary mb-0">{currentCategoryLabel}</h2>
        </Col>
        <Col xs="auto">
          <Button variant="outline-primary" onClick={toggleView}>
            {viewMode === "grid" ? <FaList /> : <FaTh />}
          </Button>
        </Col>
      </Row>

      <div className="mb-4">
        <ButtonGroup className="flex-wrap">
          {categories.map((filter) => (
            <Button
              key={filter.key}
              variant={
                activeFilter === filter.key ? "primary" : "outline-primary"
              }
              onClick={() => handleFilterClick(filter.key)}
              className="m-1"
            >
              {filter.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <Row className="g-2 mb-4 p-3 bg-light border rounded align-items-center">
        <Col md={3} sm={6} className="mb-2 mb-md-0">
          <Form.Control
            type="text"
            placeholder="Tìm kiếm theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={3} sm={6} className="mb-2 mb-md-0">
          <Form.Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Sắp xếp mặc định</option>
            <option value="name-asc">Tên (A-Z)</option>
            <option value="name-desc">Tên (Z-A)</option>
            <option value="price-asc">Giá (Thấp đến Cao)</option>
            <option value="price-desc">Giá (Cao đến Thấp)</option>
          </Form.Select>
        </Col>
        <Col md={3} sm={6} className="mb-2 mb-md-0">
          <Form.Select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <option value="">Tất cả thương hiệu</option>
            {uniqueBrands.map((brandName) => (
              <option key={brandName} value={brandName}>
                {brandName}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3} sm={6} className="mb-2 mb-md-0">
          <div className="d-flex gap-2">
            <Form.Control
              type="number"
              placeholder="Giá từ"
              value={priceRange.min === 0 ? "" : priceRange.min}
              onChange={(e) =>
                setPriceRange({
                  ...priceRange,
                  min: parseInt(e.target.value) || 0,
                })
              }
            />
            <Form.Control
              type="number"
              placeholder="Giá đến"
              value={priceRange.max === Infinity ? "" : priceRange.max}
              onChange={(e) =>
                setPriceRange({
                  ...priceRange,
                  max: parseInt(e.target.value) || Infinity,
                })
              }
            />
          </div>
        </Col>
      </Row>

      <Row
        className={
          viewMode === "grid"
            ? "g-4 row-cols-1 row-cols-md-2 row-cols-lg-3"
            : "g-4 flex-column"
        }
      >
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <Col key={product._id}>
              <ProductItem
                product={product}
                category={product.category?.name}
                viewMode={viewMode}
              />
            </Col>
          ))
        ) : (
          <Col xs={12}>
            <Card className="text-center p-5">
              <Card.Body>
                <Card.Title>Không tìm thấy sản phẩm</Card.Title>
                <Card.Text className="text-muted">
                  Vui lòng thử điều chỉnh lại bộ lọc của bạn.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Phân trang */}
      {totalPages >= 1 && (
        <Pagination className="justify-content-center mt-4">
          <Pagination.Prev
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <Pagination.Item
              key={number}
              active={number === currentPage}
              onClick={() => paginate(number)}
            >
              {number}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}
    </Container>
  );
};

export default ProductCatalog;
