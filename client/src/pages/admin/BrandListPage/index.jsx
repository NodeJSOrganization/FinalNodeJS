import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Row, Col, Form, Image, Pagination, Spinner, Alert, Modal, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BrandListPage = () => {
  const navigate = useNavigate();

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);

  // --- THÊM STATE MỚI CHO MODAL XÓA TẤT CẢ ---
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/v1/brands');
      setBrands(response.data.data);
    } catch (err) {
      setError('Không thể tải dữ liệu thương hiệu.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBrands = filteredBrands.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const openDeleteModal = (brand) => {
    setBrandToDelete(brand);
    setShowDeleteModal(true);
  };
  const closeDeleteModal = () => setShowDeleteModal(false);

  const handleDelete = async () => {
    if (!brandToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/brands/${brandToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBrands(brands.filter(b => b._id !== brandToDelete._id));
      closeDeleteModal();
    } catch (err) {
      setError(err.response?.data?.msg || 'Xóa thương hiệu thất bại.');
      closeDeleteModal();
    }
  };

  // --- HÀM XỬ LÝ XÓA TẤT CẢ ---
  const handleDeleteAll = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Phiên đăng nhập hết hạn.");
        setShowDeleteAllModal(false);
        return;
      }

      await axios.delete('/api/v1/brands', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBrands([]); // Xóa hết dữ liệu trên UI
      setShowDeleteAllModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Xóa tất cả thương hiệu thất bại.');
      setShowDeleteAllModal(false);
    }
  };


  return (
    <div className="p-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="card-custom">
            <Card.Header>
              <Card.Title as="h4" className="mb-0">Quản lý Thương hiệu</Card.Title>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
              <Row className="mb-3 align-items-center">
                <Col md={4}>
                  <Form.Group>
                    <div className="input-group">
                      <Form.Control
                        type="text"
                        placeholder="Tìm theo tên..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      />
                      <Button variant="outline-secondary"><FaSearch /></Button>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={8} className="d-flex justify-content-end align-items-center">
                  <Button variant="danger" className="me-auto" onClick={() => setShowDeleteAllModal(true)} disabled={brands.length === 0}>
                    <FaTrash className="me-2" /> Xóa tất cả
                  </Button>
                  <Form.Label className="me-2 mb-0">Hiển thị</Form.Label>
                  <Form.Select
                    style={{ width: '80px' }}
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={brands.length}>Tất cả</option>
                  </Form.Select>
                  <Button variant="primary" className="ms-3" onClick={() => navigate('/admin/brands/add')}>
                    <FaPlus className="me-2" /> Thêm mới
                  </Button>
                </Col>
              </Row>

              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" variant="primary" />
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : (
                <>
                  <Table striped bordered hover responsive className="table-custom align-middle">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Logo</th>
                        <th>Tên thương hiệu</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBrands.map((brand, index) => (
                        <tr key={brand._id}>
                          <td>{indexOfFirstItem + index + 1}</td>
                          <td>
                            <Image src={brand.logo} alt={brand.name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                          </td>
                          <td><strong>{brand.name}</strong></td>
                          <td className="text-center">
                            <Badge bg={brand.status === 'active' ? 'success' : 'secondary'}>
                              {brand.status === 'active' ? 'Hoạt động' : 'Tạm ẩn'}
                            </Badge>
                          </td>
                          <td>
                            {/* --- NÚT SỬA ĐIỀU HƯỚNG ĐẾN TRANG EDIT --- */}
                            <Button variant="warning" size="sm" className="me-2 btn-icon" onClick={() => navigate(`/admin/brands/edit/${brand._id}`)}>
                              <FaEdit />
                            </Button>
                            <Button variant="danger" size="sm" className="btn-icon" onClick={() => openDeleteModal(brand)}>
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center">
                      <Pagination>
                        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                        {[...Array(totalPages).keys()].map(number => (
                          <Pagination.Item
                            key={number + 1}
                            active={number + 1 === currentPage}
                            onClick={() => handlePageChange(number + 1)}
                          >
                            {number + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal xác nhận xóa 1 brand */}
      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>{/* ... */}</Modal>

      {/* --- MODAL MỚI CHO VIỆC XÓA TẤT CẢ --- */}
      <Modal show={showDeleteAllModal} onHide={() => setShowDeleteAllModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <FaExclamationTriangle className="me-2" /> Cảnh báo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa <strong>TẤT CẢ</strong> các thương hiệu? Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể hoàn tác.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteAllModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteAll}>
            Tôi chắc chắn, Xóa tất cả
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BrandListPage;