// src/pages/admin/OrderManagementPage/index.jsx
import React, { useState, useEffect } from 'react';
import { FaEye, FaSearch, FaSyncAlt, FaShoppingBag, FaClock, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Table, Button, Card, Row, Col, Form, Pagination, Spinner, Container } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import './OrderManagementPage.css'; // Import file CSS mới tạo

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Stats state (Để tính toán cho đẹp)
  const [stats, setStats] = useState({ total: 0, revenue: 0, pending: 0, completed: 0 });

  const API_URL = 'http://localhost:5000/api/v1/orders';
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, getAuthConfig());
      const data = res.data.data;
      setOrders(data);
      
      // Tính toán thống kê nhanh
      const totalRevenue = data.reduce((acc, order) => acc + (order.currentStatus !== 'cancelled' ? order.summary.finalTotal : 0), 0);
      const pendingCount = data.filter(o => o.currentStatus === 'pending').length;
      const completedCount = data.filter(o => o.currentStatus === 'delivered').length;

      setStats({
        total: data.length,
        revenue: totalRevenue,
        pending: pendingCount,
        completed: completedCount
      });
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối server!');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Hàm render Badge theo phong cách Soft UI
  const renderStatusBadge = (status) => {
    let className = 'badge-soft badge-soft-secondary';
    let label = status;

    switch (status) {
        case 'pending':
            className = 'badge-soft badge-soft-secondary';
            label = 'Chờ xác nhận';
            break;
        case 'confirmed':
            className = 'badge-soft badge-soft-info';
            label = 'Đã xác nhận';
            break;
        case 'shipping':
            className = 'badge-soft badge-soft-warning';
            label = 'Đang giao';
            break;
        case 'delivered':
            className = 'badge-soft badge-soft-success';
            label = 'Hoàn thành';
            break;
        case 'cancelled':
            className = 'badge-soft badge-soft-danger';
            label = 'Đã hủy';
            break;
        default:
            break;
    }
    return <span className={className}>{label}</span>;
  };

  // Logic lọc và phân trang (giữ nguyên)
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
  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter, displayCount]);

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container fluid className="p-4 bg-light min-vh-100">
      {/* --- PHẦN 1: STATS CARDS (Thống kê nhanh) --- */}
      {/* <Row className="mb-4 g-3">
        <Col md={3} sm={6}>
            <Card className="stats-card shadow-sm h-100">
                <Card.Body>
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <p className="text-muted mb-1">Tổng đơn hàng</p>
                            <h3 className="fw-bold mb-0">{stats.total}</h3>
                        </div>
                        <div className="stats-icon-wrapper bg-primary bg-opacity-10 text-primary">
                            <FaShoppingBag />
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Col>
        <Col md={3} sm={6}>
            <Card className="stats-card shadow-sm h-100">
                <Card.Body>
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <p className="text-muted mb-1">Doanh thu dự kiến</p>
                            <h4 className="fw-bold mb-0 text-success">
                                {(stats.revenue / 1000000).toFixed(1)}M <small className="text-muted fs-6">VND</small>
                            </h4>
                        </div>
                        <div className="stats-icon-wrapper bg-success bg-opacity-10 text-success">
                            <FaMoneyBillWave />
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Col>
        <Col md={3} sm={6}>
            <Card className="stats-card shadow-sm h-100">
                <Card.Body>
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <p className="text-muted mb-1">Chờ xử lý</p>
                            <h3 className="fw-bold mb-0 text-warning">{stats.pending}</h3>
                        </div>
                        <div className="stats-icon-wrapper bg-warning bg-opacity-10 text-warning">
                            <FaClock />
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Col>
        <Col md={3} sm={6}>
            <Card className="stats-card shadow-sm h-100">
                <Card.Body>
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <p className="text-muted mb-1">Hoàn thành</p>
                            <h3 className="fw-bold mb-0 text-info">{stats.completed}</h3>
                        </div>
                        <div className="stats-icon-wrapper bg-info bg-opacity-10 text-info">
                            <FaCheckCircle />
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Col>
      </Row> */}

      {/* --- PHẦN 2: THANH CÔNG CỤ & BẢNG --- */}
      <Card className="filter-card shadow-sm">
        <Card.Header className="bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold text-dark">Danh sách đơn hàng</h5>
            <Button variant="light" className="text-primary fw-bold btn-sm shadow-sm" onClick={fetchOrders}>
                <FaSyncAlt className={loading ? "fa-spin" : ""} /> Làm mới
            </Button>
        </Card.Header>
        <Card.Body>
            {/* Toolbar */}
            <Row className="mb-4 g-3">
              <Col lg={4} md={6}>
                <div className="input-group shadow-sm">
                    <span className="input-group-text bg-white border-end-0 ps-3"><FaSearch className="text-muted"/></span>
                    <Form.Control
                      type="text"
                      className="border-start-0 ps-0"
                      placeholder="Tìm kiếm khách hàng, mã đơn..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
              </Col>
              <Col lg={3} md={6}>
                <Form.Select 
                    className="shadow-sm"
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">🔍 Tất cả trạng thái</option>
                    <option value="pending">⏳ Chờ xác nhận</option>
                    <option value="confirmed">✅ Đã xác nhận</option>
                    <option value="shipping">🚚 Đang giao hàng</option>
                    <option value="delivered">🎉 Hoàn thành</option>
                    <option value="cancelled">❌ Đã hủy</option>
                </Form.Select>
              </Col>
              <Col lg={5} className="d-flex justify-content-end align-items-center text-muted">
                 <span className="me-2">Hiển thị:</span>
                 <Form.Select size="sm" style={{width: '70px'}} value={displayCount} onChange={(e) => setDisplayCount(Number(e.target.value))}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                 </Form.Select>
              </Col>
            </Row>

            {/* Bảng Dữ Liệu */}
            <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="bg-light text-uppercase text-secondary small">
                    <tr>
                      <th className="ps-4 border-0 rounded-start">Mã đơn</th>
                      <th className="border-0">Khách hàng</th>
                      <th className="border-0">Ngày đặt</th>
                      <th className="border-0 text-center">Trạng thái</th>
                      <th className="border-0 text-end">Tổng tiền</th>
                      <th className="pe-4 border-0 rounded-end text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.length > 0 ? (
                      paginatedOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="ps-4 fw-bold text-primary">
                            <Link to={`/admin/orders/${order._id}`} className="order-id-link">
                                #{order._id.slice(-6).toUpperCase()}
                            </Link>
                          </td>
                          <td>
                              <div className="fw-bold text-dark">{order.customerInfo.name}</div>
                              <small className="text-muted">{order.customerInfo.phone}</small>
                          </td>
                          <td className="text-muted small">
                             {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                             <br/>
                             {new Date(order.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="text-center">
                            {renderStatusBadge(order.currentStatus)}
                          </td>
                          <td className="text-end fw-bold text-dark">
                            {order.summary.finalTotal.toLocaleString('vi-VN')}đ
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center">
                                <Link to={`/admin/orders/${order._id}`}>
                                    <button className="btn-action-view shadow-sm" title="Xem chi tiết">
                                        <FaEye />
                                    </button>
                                </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                            <img src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png" alt="No data" width="80" className="mb-3 opacity-50"/>
                            <p className="text-muted">Không tìm thấy đơn hàng nào phù hợp.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination className="pagination-flat">
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
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderManagementPage;