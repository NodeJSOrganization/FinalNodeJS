// src/pages/admin/DiscountManagementPage/index.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Card, Row, Col, Form, Pagination, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DiscountManagementPage = () => {
  const navigate = useNavigate();

  // State
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Modals State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Fetch dữ liệu
  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('/api/v1/discounts');
      setDiscounts(data.data);
    } catch (err) {
      setError('Không thể tải danh sách mã giảm giá.');
    } finally {
      setLoading(false);
    }
  };

  // Lọc và phân trang
  const filteredDiscounts = discounts.filter(d =>
    d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage);
  const currentDiscounts = filteredDiscounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Xử lý Xóa 1
  const openDeleteModal = (discount) => {
    setDiscountToDelete(discount);
    setShowDeleteModal(true);
  };
  const handleDelete = async () => {
    if (!discountToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/discounts/${discountToDelete._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setDiscounts(discounts.filter(d => d._id !== discountToDelete._id));
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Xóa thất bại.');
      setShowDeleteModal(false);
    }
  };

  // Xử lý Xóa tất cả
  const handleDeleteAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/v1/discounts', { headers: { Authorization: `Bearer ${token}` } });
      setDiscounts([]);
      setShowDeleteAllModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Xóa tất cả thất bại.');
      setShowDeleteAllModal(false);
    }
  };

  return (
    <div className="p-4">
      <Row className="justify-content-center">
        <Col lg={12}>
          <Card className="card-custom">
            <Card.Header><Card.Title as="h4">Quản lý mã giảm giá</Card.Title></Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
              <Row className="mb-3 align-items-center">
                <Col md={4}>
                  <Form.Control type="text" placeholder="Tìm theo mã hoặc mô tả..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                </Col>
                <Col md={8} className="d-flex justify-content-end align-items-center">
                  <Button variant="danger" className="me-auto" onClick={() => setShowDeleteAllModal(true)} disabled={discounts.length === 0}><FaTrash /> Xóa tất cả</Button>
                  <Form.Label className="me-2 mb-0">Hiển thị</Form.Label>
                  <Form.Select style={{ width: '80px' }} value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                    <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option>
                  </Form.Select>
                  <Button variant="primary" className="ms-3" onClick={() => navigate('/admin/discounts/add')}><FaPlus /> Tạo mã mới</Button>
                </Col>
              </Row>

              {loading ? <div className="text-center p-5"><Spinner /></div> : (
                <>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Mã Code</th>
                        <th>Mô tả</th>
                        <th>Giá trị</th>
                        <th className="text-center">Số lượng</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDiscounts.length > 0 ? currentDiscounts.map(d => (
                        <tr key={d._id}>
                          <td><strong>{d.code}</strong></td>
                          <td>{d.description.substring(0, 40)}{d.description.length > 40 && '...'}</td>
                          <td>{d.type === 'percent' ? `${d.value}%` : `${d.value.toLocaleString('vi-VN')} VNĐ`}</td>
                          <td className="text-center">{d.quantity}</td>
                          <td><Badge bg={d.status === 'active' ? 'success' : 'secondary'}>{d.status === 'active' ? 'Hoạt động' : 'Tạm ẩn'}</Badge></td>
                          <td>
                            <Button variant="warning" size="sm" className="me-2" onClick={() => navigate(`/admin/discounts/edit/${d._id}`)}><FaEdit /></Button>
                            <Button variant="danger" size="sm" onClick={() => openDeleteModal(d)}><FaTrash /></Button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="6" className="text-center">Không có mã giảm giá nào.</td></tr>
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
        <Modal.Body>Bạn có chắc muốn xóa mã giảm giá <strong>{discountToDelete?.code}</strong>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xóa tất cả */}
      <Modal show={showDeleteAllModal} onHide={() => setShowDeleteAllModal(false)} centered>
        <Modal.Header closeButton><Modal.Title className="text-danger"><FaExclamationTriangle /> Cảnh báo</Modal.Title></Modal.Header>
        <Modal.Body>Bạn có chắc muốn xóa <strong>TẤT CẢ</strong> mã giảm giá? Hành động này không thể hoàn tác.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteAllModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDeleteAll}>Tôi chắc chắn, Xóa tất cả</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DiscountManagementPage;