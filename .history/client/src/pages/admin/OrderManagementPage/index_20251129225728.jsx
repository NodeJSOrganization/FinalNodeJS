// src/pages/admin/OrderManagementPage/index.jsx
import React, { useState, useEffect } from 'react';
import { FaEye, FaSearch, FaSyncAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Table, Button, Badge, Card, Row, Col, Form, Pagination, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

// Map trạng thái để hiển thị màu sắc và tên tiếng Việt
const STATUS_MAP = {
  pending: { label: 'Chờ xác nhận', color: 'secondary' },
  confirmed: { label: 'Đã xác nhận', color: 'info' },
  shipping: { label: 'Đang giao hàng', color: 'warning' },
  delivered: { label: 'Hoàn thành', color: 'success' },
  cancelled: { label: 'Đã hủy', color: 'danger' }
};

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]); // State lưu danh sách đơn hàng thật
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(5);
  const [statusFilter, setStatusFilter] = useState('all'); // Mặc định là 'all'
  const [currentPage, setCurrentPage] = useState(1);

  // Cấu hình API
  const API_URL = 'http://localhost:5000/api/v1/orders';
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Hàm gọi API lấy danh sách đơn hàng
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, getAuthConfig());
      // Backend trả về: { success: true, count: ..., data: [...] }
      setOrders(res.data.data); 
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách đơn hàng!');
      setLoading(false);
    }
  };

  // Gọi API khi component được mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // --- LOGIC LỌC VÀ PHÂN TRANG (Client-side) ---
  
  const filteredOrders = orders
    // 1. Lọc theo trạng thái
    .filter(order => {
      if (statusFilter === 'all') return true;
      return order.currentStatus === statusFilter;
    })
    // 2. Lọc theo từ khóa (Mã đơn hoặc Tên khách)
    .filter(order => {
      const searchLower = searchTerm.toLowerCase();
      const orderIdShort = order._id.slice(-6).toLowerCase(); // Tìm theo 6 số cuối mã đơn
      const customerName = order.customerInfo?.name?.toLowerCase() || '';
      
      return customerName.includes(searchLower) || 
             order._id.toLowerCase().includes(searchLower) ||
             orderIdShort.includes(searchLower);
    });

  // 3. Phân trang
  const totalPages = Math.ceil(filteredOrders.length / displayCount);
  const startIndex = (currentPage - 1) * displayCount;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + displayCount);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, displayCount]);


  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <Row>
      <Col xs={12}>
        <Card className="card-custom shadow-sm">
          <Card.Header className="d-flex justify-content-between align-items-center bg-white">
            <Card.Title as="h4" className="mb-0 text-primary fw-bold">Quản lý đơn hàng</Card.Title>
            <Button variant="outline-primary" size="sm" onClick={fetchOrders}>
                <FaSyncAlt className="me-2"/> Làm mới
            </Button>
          </Card.Header>
          <Card.Body>
            {/* --- THANH CÔNG CỤ TÌM KIẾM & LỌC --- */}
            <Row className="mb-4 g-3">
              <Col md={4}>
                <Form.Group>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><FaSearch className="text-muted"/></span>
                    <Form.Control
                      type="text"
                      placeholder="Tìm tên khách, mã đơn..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <div className="d-flex align-items-center">
                  <Form.Label className="me-2 mb-0 fw-bold text-nowrap">Trạng thái:</Form.Label>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-select-sm"
                  >
                    <option value="all">Tất cả</option>
                    <option value="pending">Chờ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="shipping">Đang giao hàng</option>
                    <option value="delivered">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </Form.Select>
                </div>
              </Col>

              <Col md={4} className="d-flex justify-content-md-end align-items-center">
                <Form.Label className="me-2 mb-0 text-nowrap">Hiển thị:</Form.Label>
                <Form.Select
                  style={{ width: '80px' }}
                  value={displayCount}
                  onChange={(e) => setDisplayCount(Number(e.target.value))}
                  size="sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={100}>100</option>
                </Form.Select>
              </Col>
            </Row>

            {/* --- BẢNG DỮ LIỆU --- */}
            <Table hover responsive className="table-custom align-middle">
              <thead className="bg-light text-secondary">
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Thanh toán</th>
                  <th>Tổng tiền</th>
                  <th className="text-center">Trạng thái</th>
                  <th className="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => {
                    const statusInfo = STATUS_MAP[order.currentStatus] || { label: order.currentStatus, color: 'secondary' };
                    
                    return (
                      <tr key={order._id}>
                        <td className="fw-bold">#{order._id.slice(-6).toUpperCase()}</td>
                        <td>
                            <div className="fw-bold">{order.customerInfo.name}</div>
                            <small className="text-muted">{order.customerInfo.phone}</small>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="text-uppercase small">{order.paymentMethod}</td>
                        <td className="fw-bold text-primary">{order.summary.finalTotal.toLocaleString('vi-VN')}đ</td>
                        <td className="text-center">
                          <Badge bg={statusInfo.color} className="px-3 py-2">
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Button 
                            as={Link} 
                            to={`/admin/orders/${order._id}`} // Link sang trang chi tiết
                            variant="light" 
                            size="sm" 
                            className="text-info border-0 shadow-sm"
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                        Không tìm thấy đơn hàng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* --- PHÂN TRANG --- */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {[...Array(totalPages).keys()].map(number => (
                    <Pagination.Item
                      key={number + 1}
                      active={number + 1 === currentPage}
                      onClick={() => handlePageChange(number + 1)}
                    >
                      {number + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default OrderManagementPage;