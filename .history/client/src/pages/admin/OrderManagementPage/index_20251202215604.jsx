// src/pages/admin/OrderManagementPage/index.jsx
import React, { useState, useEffect } from 'react';
import { FaEye, FaSearch, FaSyncAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Table, Button, Badge, Card, Row, Col, Form, Pagination, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
// Bạn có thể dùng chung file CSS với ProductManagement hoặc tạo file mới với nội dung tương tự
import './OrderManagementPage.css'; 

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const API_URL = 'http://localhost:5000/api/v1/orders';
  
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL, getAuthConfig());
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách đơn hàng.');
      toast.error('Lỗi kết nối server!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Hàm render Badge chuẩn Bootstrap (Đồng bộ màu sắc)
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="secondary">Chờ xác nhận</Badge>;
      case 'confirmed':
        return <Badge bg="primary">Đã xác nhận</Badge>; // Dùng màu Primary cho đồng bộ
      case 'shipping':
        return <Badge bg="warning" text="dark">Đang giao</Badge>;
      case 'delivered':
        return <Badge bg="success">Hoàn thành</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Đã hủy</Badge>;
      default:
        return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  // Logic lọc và phân trang
  const filteredOrders = orders
    .filter(order => statusFilter === 'all' ? true : order.currentStatus === statusFilter)
    .filter(order => {
      const searchLower = searchTerm.toLowerCase();
      const orderIdShort = order._id.slice(-6).toLowerCase();
      const customerName = order.customerInfo?.name?.toLowerCase() || '';
      return customerName.includes(searchLower) || orderIdShort.includes(searchLower);
    });

  const totalPages = Math.ceil(filteredOrders.length / displayCount);
  const startIndex = (currentPage - 1) * displayCount;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + displayCount);

  const handlePageChange = (page) => setCurrentPage(page);
  
  // Reset trang về 1 khi filter thay đổi
  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter, displayCount]);

  return (
    <div className="p-4">
      <Row className="justify-content-center">
        <Col>
          <Card className="card-custom">
            <Card.Header>
              <Card.Title as="h4" className="mb-0">Quản lý đơn hàng</Card.Title>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

              {/* THANH CÔNG CỤ (Giống ProductManagement) */}
              <Row className="mb-3 align-items-center">
                {/* Bên trái: Tìm kiếm */}
                <Col md={4}>
                  <Form.Control 
                    type="text" 
                    placeholder="Tìm đơn hàng, tên khách..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </Col>

                {/* Bên phải: Các bộ lọc và nút */}
                <Col md={8} className="d-flex justify-content-end align-items-center gap-2">
                   {/* Lọc Trạng Thái */}
                   <Form.Select 
                    style={{ width: '160px' }} 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="shipping">Đang giao hàng</option>
                    <option value="delivered">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </Form.Select>

                  {/* Chọn số lượng hiển thị */}
                  <div className="d-flex align-items-center">
                    <Form.Label className="me-2 mb-0 text-nowrap">Hiển thị</Form.Label>
                    <Form.Select 
                        style={{ width: '70px' }} 
                        value={displayCount} 
                        onChange={(e) => setDisplayCount(Number(e.target.value))}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </Form.Select>
                  </div>

                  {/* Nút Làm mới */}
                  <Button variant="outline-primary" onClick={fetchOrders} title="Làm mới">
                    <FaSyncAlt className={loading ? "fa-spin" : ""} />
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
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Ngày đặt</th>
                        <th className="text-center">Trạng thái</th>
                        <th className="text-end">Tổng tiền</th>
                        <th className="text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.length > 0 ? (
                        paginatedOrders.map((order, index) => (
                          <tr key={order._id}>
                            <td>{(currentPage - 1) * displayCount + index + 1}</td>
                            <td className="fw-bold">
                              <Link to={`/admin/orders/${order._id}`} className="text-decoration-none">
                                #{order._id.slice(-6).toUpperCase()}
                              </Link>
                            </td>
                            <td>
                              <div className="fw-bold">{order.customerInfo.name}</div>
                              <small className="text-muted">{order.customerInfo.phone}</small>
                            </td>
                            <td>
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                              <br />
                              <small className="text-muted">
                                {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </small>
                            </td>
                            <td className="text-center">
                              {renderStatusBadge(order.currentStatus)}
                            </td>
                            <td className="text-end fw-bold text-danger">
                              {order.summary.finalTotal.toLocaleString('vi-VN')}đ
                            </td>
                            <td className="text-center">
                              <Link to={`/admin/orders/${order._id}`}>
                                <Button variant="info" size="sm" title="Xem chi tiết">
                                  <FaEye /> Xem
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            Không tìm thấy đơn hàng nào phù hợp.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>

                  {/* Phân trang */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-3">
                      <Pagination>
                        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                        {[...Array(totalPages).keys()].map(n => (
                          <Pagination.Item key={n + 1} active={n + 1 === currentPage} onClick={() => handlePageChange(n + 1)}>
                            {n + 1}
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
    </div>
  );
};

export default OrderManagementPage;