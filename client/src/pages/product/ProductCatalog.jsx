import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setProducts } from "../../../features/product/productReducer";
import ProductItem from "../../components/product/ProductItem";
import axios from "axios";

const filters = [
  { key: "all", label: "Tất cả sản phẩm" },
  { key: "Laptop", label: "Laptop" },
  { key: "Màn hình", label: "Màn hình" },
  { key: "Ram", label: "Ổ cứng" },
];

const ProductCatalog = () => {
  const allProducts = useSelector((state) => state.product.products);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { category } = useParams();

  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });

  const uniqueBrands = useMemo(
    () => [...new Set(allProducts.map((product) => product.brand.name))],
    [allProducts]
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("/api/v1/products");
        dispatch(setProducts(data.data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const filterKeyFromPath = category || "all";
    if (filters.some((f) => f.key === filterKeyFromPath)) {
      setActiveFilter(filterKeyFromPath);
    } else {
      setActiveFilter("all");
      navigate("/products");
    }
  }, [category, navigate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, sortBy, searchTerm, selectedBrand, priceRange]);

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    if (activeFilter !== "all") {
      const categoryToFilter = filters.find((f) => f.key === activeFilter)?.key;

      if (categoryToFilter) {
        products = products.filter(
          (product) => product.category.name === categoryToFilter
        );
      } else {
        products = [];
      }
    }

    if (searchTerm) {
      products = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBrand) {
      products = products.filter(
        (product) => product.brand.name === selectedBrand
      );
    }

    products = products.filter((product) => {
      const productPrice = product.variants[0].sellingPrice;
      return productPrice >= priceRange.min && productPrice <= priceRange.max;
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
          (a, b) => a.variants[0].sellingPrice - b.variants[0].sellingPrice
        );
        break;
      case "price-desc":
        products.sort(
          (a, b) => b.variants[0].sellingPrice - a.variants[0].sellingPrice
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

  const productsPerPage = 6;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const toggleView = () => setViewMode(viewMode === "grid" ? "list" : "grid");

  const handleFilterClick = (filterKey) => {
    const path = filterKey === "all" ? "/products" : `/${filterKey}`;
    navigate(path);
  };

  const currentCategoryName =
    filters.find((f) => f.key === activeFilter)?.label || "Sản phẩm";

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="text-primary mb-0">{currentCategoryName}</h2>
        </Col>
        <Col xs="auto">
          <Button variant="outline-primary" onClick={toggleView}>
            {viewMode === "grid" ? <FaList /> : <FaTh />}
          </Button>
        </Col>
      </Row>

      <div className="mb-4">
        <ButtonGroup className="flex-wrap">
          {filters.map((filter) => (
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

      <Row className="g-2 mb-4 p-3 bg-light border rounded">
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
            {uniqueBrands.map((brand) => (
              <option key={brand._id} value={brand.name}>
                {brand}
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
                category={product.category.name}
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

      {totalPages > 1 && (
        <Pagination className="justify-content-center mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <Pagination.Item
              key={number}
              active={number === currentPage}
              onClick={() => paginate(number)}
            >
              {number}
            </Pagination.Item>
          ))}
        </Pagination>
      )}
    </Container>
  );
};

export default ProductCatalog;
