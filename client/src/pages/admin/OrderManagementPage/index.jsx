import React, { useState } from 'react';
import { FaEye, FaSearch } from 'react-icons/fa';
import { mockOrders } from '../../../data/mockData';
import { Link } from 'react-router-dom';
import { Table, Button, Badge, Card, Row, Col, Form, Pagination } from 'react-bootstrap';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Hoàn thành': return 'success';
    case 'Đang xử lý': return 'warning';
    case 'Đã hủy': return 'danger';
    default: return 'secondary';
  }
};



const OrderManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(5);
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);

  // Bước 1: Lọc dữ liệu theo trạng thái và tìm kiếm (chưa phân trang)
  const filteredData = mockOrders
    .filter(order => {
      if (statusFilter === 'Tất cả') return true;
      return order.status === statusFilter;
    })
    .filter(order =>
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Bước 2: Tính toán các thông số cho phân trang
  const totalPages = Math.ceil(filteredData.length / displayCount); // Tổng số trang
  const startIndex = (currentPage - 1) * displayCount; // Vị trí bắt đầu cắt
  const endIndex = startIndex + displayCount; // Vị trí kết thúc cắt

  // Bước 3: Cắt dữ liệu để chỉ lấy các mục cho trang hiện tại
  const paginatedOrders = filteredData.slice(startIndex, endIndex);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // ✨ LOGIC LỌC DỮ LIỆU ĐA CẤP ✨
  const filteredOrders = mockOrders
    // Lọc theo trạng thái trước
    .filter(order => {
      if (statusFilter === 'Tất cả') return true;
      return order.status === statusFilter;
    })
    // Sau đó lọc theo từ khóa tìm kiếm
    .filter(order =>
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    // Cuối cùng là giới hạn số lượng hiển thị
    .slice(0, displayCount);

  return (
    <Row>
      <Col xs={12}>
        <Card className="card-custom">
          <Card.Header>
            <Card.Title as="h4" className="mb-0">Quản lý đơn hàng</Card.Title>
          </Card.Header>
          <Card.Body>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <div className="input-group">
                    <Form.Control
                      type="text"
                      placeholder="Tìm theo tên khách hàng, mã đơn..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline-secondary"><FaSearch /></Button>
                  </div>
                </Form.Group>
              </Col>
              {/* ✨ BỘ LỌC THEO TRẠNG THÁI ✨ */}
              <Col md={4} className="d-flex align-items-center">
                <Form.Label className="me-2 mb-0">Trạng thái</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="Tất cả">Tất cả</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Đã hủy">Đã hủy</option>
                </Form.Select>
              </Col>
              <Col md={4} className="d-flex align-items-center">
                <Form.Label className="me-2 mb-0 ms-md-auto">Hiển thị</Form.Label>
                <Form.Select
                  style={{ width: '80px' }}
                  value={displayCount}
                  onChange={(e) => setDisplayCount(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={mockOrders.length}>Tất cả</option>
                </Form.Select>
              </Col>
            </Row>

            <Table striped bordered hover responsive className="table-custom align-middle">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Tên khách hàng</th>
                  <th>Ngày đặt</th>
                  {/* ✨ THUỘC TÍNH MỚI ✨ */}
                  <th>P.thức TT</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customerName}</td>
                    <td>{order.orderDate}</td>
                    {/* ✨ THUỘC TÍNH MỚI: Hiển thị phương thức thanh toán */}
                    <td>{order.paymentMethod}</td>
                    <td>{order.total.toLocaleString('vi-VN')}đ</td>
                    <td>
                      <Badge bg={getStatusBadge(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td>
                      <Button as={Link} to={`/admin/orders/${order.id}`} variant="info" size="sm" className="btn-icon">
                        <FaEye />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {totalPages > 1 && (
              <div className="d-flex justify-content-center">
                <Pagination>
                  {/* Nút về trang trước */}
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />

                  {/* Render ra các nút số trang */}
                  {[...Array(totalPages).keys()].map(number => (
                    <Pagination.Item
                      key={number + 1}
                      active={number + 1 === currentPage}
                      onClick={() => handlePageChange(number + 1)}
                    >
                      {number + 1}
                    </Pagination.Item>
                  ))}

                  {/* Nút đến trang sau */}
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