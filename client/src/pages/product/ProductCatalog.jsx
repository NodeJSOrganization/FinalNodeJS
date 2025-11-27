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
  Spinner,
  Alert,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setProducts } from "../../../features/product/productReducer";
import ProductItem from "../../components/product/ProductItem";
import axios from "axios";

// Loại bỏ mảng filters gán cứng
/*
const filters = [
  { key: "all", label: "Tất cả sản phẩm" },
  { key: "Laptop", label: "Laptop" },
  { key: "Màn hình", label: "Màn hình" },
  { key: "Ram", label: "Ổ cứng" },
];
*/

const ProductCatalog = () => {
  const allProducts = useSelector((state) => state.product.products);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { category } = useParams();

  // State mới cho danh mục động
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

  // 1. Lấy danh sách danh mục và sản phẩm
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

        // Thêm mục "Tất cả" vào đầu danh sách categories
        const dynamicCategories = categoriesResponse.data.data
          .filter((cat) => cat.status === "active") // Chỉ lấy danh mục hoạt động
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

  // 2. Cập nhật filter dựa trên URL và danh mục động
  useEffect(() => {
    const filterKeyFromPath = category || "all";
    const foundCategory = categories.find((f) => f.key === filterKeyFromPath);

    if (foundCategory) {
      setActiveFilter(filterKeyFromPath);
    } else if (categories.length > 0) {
      // Nếu danh mục không tồn tại và categories đã được tải, chuyển hướng về /products
      setActiveFilter("all");
      navigate("/products", { replace: true });
    }
    // Categories.length > 0 đảm bảo useEffect này chỉ chạy sau khi categories đã được fetch
  }, [category, navigate, categories]);

  // Đặt lại trang khi bộ lọc thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, sortBy, searchTerm, selectedBrand, priceRange]);

  // 3. Lấy danh sách thương hiệu độc nhất (Đã sửa để xử lý Brand object)
  const uniqueBrands = useMemo(() => {
    const brandsMap = new Map();
    allProducts.forEach((product) => {
      // Đảm bảo brand đã được populate và có _id
      if (product.brand && product.brand._id) {
        brandsMap.set(product.brand._id, product.brand.name);
      }
    });
    // Trả về một mảng các đối tượng { _id, name } nếu cần cho tối ưu,
    // hoặc chỉ là mảng tên như hiện tại, nhưng đảm bảo name là duy nhất
    return Array.from(brandsMap.values());
  }, [allProducts]);

  // 4. Logic Lọc Sản phẩm Chính
  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    // Lọc theo Danh mục
    if (activeFilter !== "all") {
      products = products.filter(
        (product) => product.category?.name === activeFilter
      );
    }

    // Lọc theo Tìm kiếm
    if (searchTerm) {
      products = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo Thương hiệu (Sử dụng tên thương hiệu)
    if (selectedBrand) {
      products = products.filter(
        (product) => product.brand?.name === selectedBrand
      );
    }

    // Lọc theo Giá (Cần kiểm tra sản phẩm có variants và sellingPrice không)
    products = products.filter((product) => {
      // Đảm bảo có variants và lấy giá của variant đầu tiên (Giả định của bạn)
      if (!product.variants || product.variants.length === 0) return false;

      const productPrice = product.variants[0].sellingPrice;

      // Xử lý giá Max là Infinity
      const maxPrice =
        priceRange.max === Infinity ? Number.MAX_SAFE_INTEGER : priceRange.max;

      return productPrice >= priceRange.min && productPrice <= maxPrice;
    });

    // Sắp xếp
    switch (sortBy) {
      case "name-asc":
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        // Sắp xếp theo giá variant đầu tiên
        products.sort(
          (a, b) =>
            (a.variants[0]?.sellingPrice || 0) -
            (b.variants[0]?.sellingPrice || 0)
        );
        break;
      case "price-desc":
        // Sắp xếp theo giá variant đầu tiên
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

  // Phân trang
  const productsPerPage = 9; // Tăng lên 9 sản phẩm/trang để phù hợp với lưới 3 cột
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const toggleView = () => setViewMode(viewMode === "grid" ? "list" : "grid");

  const handleFilterClick = (filterKey) => {
    // Chuyển hướng đến URL mới
    const path = filterKey === "all" ? "/products" : `/products/${filterKey}`;
    navigate(path);
  };

  const currentCategoryLabel =
    categories.find((f) => f.key === activeFilter)?.label || "Tất cả Sản phẩm";

  // Xử lý Loading và Error
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

      {/* Bộ lọc Danh mục Động */}
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

      {/* Bộ lọc Tìm kiếm, Sắp xếp, Thương hiệu, Giá */}
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
            {/* Brands Động */}
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
                  // Đặt lại thành Infinity nếu trường input rỗng
                  max: parseInt(e.target.value) || Infinity,
                })
              }
            />
          </div>
        </Col>
      </Row>

      {/* Hiển thị Sản phẩm */}
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
                category={product.category?.name} // Đảm bảo an toàn
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
      {totalPages >= 1 && ( // Đảm bảo hiển thị nếu có 1 trang hoặc nhiều hơn (theo yêu cầu đề bài)
        <Pagination className="justify-content-center mt-4">
          {/* Nút Previous */}
          <Pagination.Prev
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          />

          {/* Hiển thị tất cả các số trang */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <Pagination.Item
              key={number}
              active={number === currentPage}
              onClick={() => paginate(number)}
            >
              {number}
            </Pagination.Item>
          ))}

          {/* Nút Next */}
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
