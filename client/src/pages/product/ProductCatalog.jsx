import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaTh, FaList } from "react-icons/fa";
import { ProductSampleData } from "../../data/ProductSampleData";
import { useDispatch, useSelector } from "react-redux";
import { setProducts } from "../../../features/product/productReducer";
import ProductItem from "../../components/product/ProductItem";

const ProductCatalog = () => {
  const products = useSelector((state) => state.product.products);

  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const { category } = useParams();

  const productsPerPage = 6;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(products.length / productsPerPage);

  useEffect(() => {
    if (!category || !Object.keys(ProductSampleData).includes(category)) {
      const allProducts = Object.values(ProductSampleData).flat();

      console.log("allProduct", allProducts);
      dispatch(setProducts(allProducts));
    } else {
      console.log("aa");
      dispatch(setProducts(ProductSampleData[category] || []));
    }
    setCurrentPage(1);
  }, [category]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleView = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  return (
    <div className="container py-4 ">
      <h2 className="text-primary">
        Danh mục: {category.charAt(0).toUpperCase() + category.slice(1)}
      </h2>
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-outline-primary me-2" onClick={toggleView}>
          {viewMode === "grid" ? <FaList /> : <FaTh />} Switch View
        </button>
      </div>
      <div
        className={
          viewMode === "grid"
            ? "row row-cols-1 row-cols-md-2 row-cols-lg-3 g-5"
            : "d-flex flex-column gap-4"
        }
      >
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <div key={product.id} className={viewMode === "grid" ? "col" : ""}>
              <ProductItem product={product} category={category} />
            </div>
          ))
        ) : (
          <p>Không có sản phẩm trong danh mục này.</p>
        )}
      </div>
      <nav className="mt-4">
        <ul className="pagination justify-content-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <li
              key={number}
              className={`page-item ${currentPage === number ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => paginate(number)}>
                {number}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default ProductCatalog;
