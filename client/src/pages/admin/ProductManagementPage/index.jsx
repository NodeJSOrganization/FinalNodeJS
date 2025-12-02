// src/pages/admin/ProductManagementPage/index.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Card, Row, Col, Form, Pagination, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductManagement.css';

const ProductManagementPage = () => {
  const navigate = useNavigate();

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // State cho Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Fetch dữ liệu
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('/api/v1/products');
      setProducts(data.data);
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  // Logic lọc và phân trang
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Xử lý Xóa 1 sản phẩm
  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/products/${productToDelete._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(products.filter(p => p._id !== productToDelete._id));
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Xóa sản phẩm thất bại.');
      setShowDeleteModal(false);
    }
  };

  // Xử lý Xóa tất cả sản phẩm
  const handleDeleteAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/v1/products', { headers: { Authorization: `Bearer ${token}` } });
      setProducts([]);
      setShowDeleteAllModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Xóa tất cả sản phẩm thất bại.');
      setShowDeleteAllModal(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-4">
      <Row className="justify-content-center">
        <Col>
          <Card className="card-custom">
            <Card.Header>
              <Card.Title as="h4" className="mb-0">Quản lý sản phẩm</Card.Title>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

              <Row className="mb-3 align-items-center">
                <Col md={4}>
                  <Form.Control type="text" placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                </Col>
                <Col md={8} className="d-flex justify-content-end align-items-center">
                  <Button variant="danger" className="me-auto" onClick={() => setShowDeleteAllModal(true)} disabled={products.length === 0}>
                    <FaTrash /> Xóa tất cả
                  </Button>
                  <Form.Label className="me-2 mb-0">Hiển thị</Form.Label>
                  <Form.Select style={{ width: '80px' }} value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                    <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option>
                  </Form.Select>
                  <Button variant="primary" className="ms-3" onClick={() => navigate('/admin/products/add')}>
                    <FaPlus /> Thêm sản phẩm
                  </Button>
                </Col>
              </Row>

              {loading ? (
                <div className="text-center p-5"><Spinner /></div>
              ) : (
                <>
                  <Table striped bordered hover responsive className="table-custom align-middle">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Tên sản phẩm</th>
                        <th>Hình ảnh</th>
                        <th>Danh mục</th>
                        <th>Thương hiệu</th>
                        <th>Giá bán (tham khảo)</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProducts.length > 0 ? currentProducts.map((product, index) => (
                        <tr key={product._id}>
                          <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td><strong>{product.name}</strong></td>
                          <td>
                            <img
                              src={product.images?.[0]?.url || 'https://via.placeholder.com/150'}
                              alt={product.name}
                              className="product-thumbnail"
                            />
                          </td>
                          <td>{product.category?.name || 'N/A'}</td>
                          <td>{product.brand?.name || 'N/A'}</td>
                          <td>
                            {product.variants?.[0]?.sellingPrice.toLocaleString('vi-VN')}đ
                          </td>
                          <td>
                            <Button variant="warning" size="sm" className="me-2" onClick={() => navigate(`/admin/products/edit/${product._id}`)}>
                              <FaEdit />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => openDeleteModal(product)}>
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="7" className="text-center">Không có sản phẩm nào.</td></tr>
                      )}
                    </tbody>
                  </Table>

                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center">
                      <Pagination>
                        <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
                        {[...Array(totalPages).keys()].map(num => (
                          <Pagination.Item key={num + 1} active={num + 1 === currentPage} onClick={() => setCurrentPage(num + 1)}>
                            {num + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal xóa 1 */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Xác nhận xóa</Modal.Title></Modal.Header>
        <Modal.Body>Bạn chắc chắn muốn xóa sản phẩm <strong>{productToDelete?.name}</strong>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xóa tất cả */}
      <Modal show={showDeleteAllModal} onHide={() => setShowDeleteAllModal(false)} centered>
        <Modal.Header closeButton><Modal.Title className="text-danger"><FaExclamationTriangle /> Cảnh báo</Modal.Title></Modal.Header>
        <Modal.Body>Bạn có chắc muốn xóa <strong>TẤT CẢ</strong> sản phẩm? Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể hoàn tác.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteAllModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDeleteAll}>Tôi chắc chắn, Xóa tất cả</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductManagementPage;