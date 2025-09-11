// src/pages/admin/PromotionManagementPage/index.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Card, Row, Col, Form, Pagination, Spinner, Alert, Modal, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PromotionManagementPage = () => {
  const navigate = useNavigate();

  // State
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // State cho Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Fetch dữ liệu khi component được mount
  useEffect(() => {
    fetchPromotions();
  }, []);

  // ===== SỬA LỖI 401 UNAUTHORIZED TẠI ĐÂY =====
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Lấy token từ localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }
      
      // 2. Tạo config object cho headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // 3. Gửi request GET kèm theo config
      const { data } = await axios.get('/api/v1/promotions', config);
      
      setPromotions(data.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Không thể tải danh sách chương trình khuyến mãi.');
    } finally {
      setLoading(false);
    }
  };
  // ===============================================

  // Logic lọc và phân trang
  const filteredPromotions = promotions.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const currentPromotions = filteredPromotions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Xử lý Xóa 1 chương trình khuyến mãi
  const openDeleteModal = (promotion) => {
    setPromotionToDelete(promotion);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!promotionToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/promotions/${promotionToDelete._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setPromotions(promotions.filter(p => p._id !== promotionToDelete._id));
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Xóa chương trình khuyến mãi thất bại.');
      setShowDeleteModal(false);
    }
  };

  // Xử lý Xóa tất cả chương trình khuyến mãi
  const handleDeleteAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/v1/promotions', { headers: { Authorization: `Bearer ${token}` } });
      setPromotions([]);
      setShowDeleteAllModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Xóa tất cả chương trình khuyến mãi thất bại.');
      setShowDeleteAllModal(false);
    }
  };
  
  // Helper function để format hiển thị
  const formatPromotionValue = (type, value) => {
    if (type === 'percent') {
      return `${value}%`;
    }
    return `${value.toLocaleString('vi-VN')}đ`;
  };

  const formatPromotionType = (type) => {
    return type === 'percent' ? 'Giảm theo %' : 'Giảm tiền mặt';
  }

  return (
    <div className="p-4">
      <Row className="justify-content-center">
        <Col>
          <Card className="card-custom">
            <Card.Header>
              <Card.Title as="h4" className="mb-0">Quản lý Khuyến mãi</Card.Title>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

              <Row className="mb-3 align-items-center">
                <Col md={4}>
                  <Form.Control type="text" placeholder="Tìm kiếm theo tên..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                </Col>
                <Col md={8} className="d-flex justify-content-end align-items-center">
                  <Button variant="danger" className="me-auto" onClick={() => setShowDeleteAllModal(true)} disabled={promotions.length === 0}>
                    <FaTrash /> Xóa tất cả
                  </Button>
                  <Form.Label className="me-2 mb-0">Hiển thị</Form.Label>
                  <Form.Select style={{ width: '80px' }} value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                    <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option>
                  </Form.Select>
                  <Button variant="primary" className="ms-3" onClick={() => navigate('/admin/promotions/add')}>
                    <FaPlus /> Thêm khuyến mãi
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
                        <th>Tên chương trình</th>
                        <th>Loại</th>
                        <th>Giá trị</th>
                        <th>Sản phẩm áp dụng</th>
                        <th>Ngày bắt đầu</th>
                        <th>Ngày kết thúc</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPromotions.length > 0 ? currentPromotions.map((promo, index) => (
                        // ===== SỬA LỖI KEY BỊ TRÙNG TẠI ĐÂY =====
                        <tr key={promo._id}>
                        {/* ======================================= */}
                          <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td><strong>{promo.name}</strong></td>
                          <td><Badge bg="info">{formatPromotionType(promo.type)}</Badge></td>
                          <td><Badge bg="success">{formatPromotionValue(promo.type, promo.value)}</Badge></td>
                          <td className="text-center">
                            <OverlayTrigger
                                placement="top"
                                overlay={
                                    <Tooltip id={`tooltip-${promo._id}`}>
                                        {promo.appliedProducts.map(p => p.name).join(', ')}
                                    </Tooltip>
                                }
                            >
                                <Badge pill bg="secondary" style={{cursor: 'pointer'}}>
                                    {promo.appliedProducts?.length || 0}
                                </Badge>
                            </OverlayTrigger>
                          </td>
                          <td>{new Date(promo.startDate).toLocaleDateString('vi-VN')}</td>
                          <td>{new Date(promo.endDate).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <Button variant="warning" size="sm" className="me-2" onClick={() => navigate(`/admin/promotions/edit/${promo._id}`)}>
                              <FaEdit />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => openDeleteModal(promo)}>
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="8" className="text-center">Không có chương trình khuyến mãi nào.</td></tr>
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
        <Modal.Body>Bạn chắc chắn muốn xóa chương trình khuyến mãi <strong>{promotionToDelete?.name}</strong>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xóa tất cả */}
      <Modal show={showDeleteAllModal} onHide={() => setShowDeleteAllModal(false)} centered>
        <Modal.Header closeButton><Modal.Title className="text-danger"><FaExclamationTriangle /> Cảnh báo</Modal.Title></Modal.Header>
        <Modal.Body>Bạn có chắc muốn xóa <strong>TẤT CẢ</strong> chương trình khuyến mãi? Hành động này không thể hoàn tác.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteAllModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDeleteAll}>Tôi chắc chắn, Xóa tất cả</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PromotionManagementPage;