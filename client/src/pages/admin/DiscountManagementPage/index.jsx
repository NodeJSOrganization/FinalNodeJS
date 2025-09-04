// src/pages/admin/DiscountManagementPage/index.jsx
import React, { useState } from 'react';
// ✨ IMPORT THÊM PAGINATION ✨
import { Table, Button, Badge, Card, Row, Col, Form, Pagination } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { mockDiscounts } from '../../../data/mockData';

const DiscountManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // ✨ STATE MỚI CHO PHÂN TRANG ✨
  const [currentPage, setCurrentPage] = useState(1);
  const [displayCount, setDisplayCount] = useState(5);

  // --- LOGIC LỌC VÀ PHÂN TRANG MỚI ---
  const filteredData = mockDiscounts
    .filter(discount => 
      discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredData.length / displayCount);
  const startIndex = (currentPage - 1) * displayCount;
  const endIndex = startIndex + displayCount;

  const paginatedDiscounts = filteredData.slice(startIndex, endIndex);
  
  // Hàm xử lý chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="card-custom">
            <Card.Header>
              <Card.Title as="h4" className="mb-0">Quản lý mã giảm giá</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3 align-items-center">
                <Col md={6}>
                  <Form.Group>
                    <div className="input-group">
                      <Form.Control 
                        type="text" 
                        placeholder="Tìm theo mã hoặc mô tả..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} // Reset về trang 1
                      />
                      <Button variant="outline-secondary">
                        <FaSearch />
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6} className="d-flex justify-content-end align-items-center">
                  <Form.Label className="me-2 mb-0">Hiển thị</Form.Label>
                  <Form.Select 
                    style={{ width: '80px' }}
                    value={displayCount}
                    onChange={(e) => { setDisplayCount(Number(e.target.value)); setCurrentPage(1); }} // Reset về trang 1
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={mockDiscounts.length}>Tất cả</option>
                  </Form.Select>
                  <Button variant="primary" className="ms-3">
                    <FaPlus className="me-2" /> Tạo mã mới
                  </Button>
                </Col>
              </Row>

              <Table striped bordered hover responsive className="table-custom align-middle">
                <thead>
                  <tr>
                    <th>Mã Code</th>
                    <th>Mô tả</th>
                    <th>Giá trị</th>
                    <th className="text-center">Số lượng</th>
                    <th>Ngày hết hạn</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {/* ✨ SỬ DỤNG DỮ LIỆU ĐÃ PHÂN TRANG ✨ */}
                  {paginatedDiscounts.map((discount) => (
                    <tr key={discount.id}>
                      <td><strong>{discount.code}</strong></td>
                      <td>{discount.description}</td>
                      <td>{discount.value}</td>
                      <td className="text-center">{discount.quantity}</td>
                      <td>{discount.expiryDate}</td>
                      <td>
                        <Badge bg={discount.status === 'Đang hoạt động' ? 'success' : 'secondary'}>
                          {discount.status}
                        </Badge>
                      </td>
                      <td>
                        <Button variant="warning" size="sm" className="me-2 btn-icon"><FaEdit /></Button>
                        <Button variant="danger" size="sm" className="btn-icon"><FaTrash /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {/* ✨ THÊM COMPONENT PHÂN TRANG ✨ */}
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DiscountManagementPage;