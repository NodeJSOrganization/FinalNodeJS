// src/pages/admin/PromotionManagementPage/index.jsx
import React, { useState } from 'react';
// ✨ IMPORT THÊM PAGINATION VÀ LINK ✨
import { Table, Button, Badge, Card, Row, Col, Form, Pagination } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { mockPromotions } from '../../../data/mockData';
import { Link } from 'react-router-dom';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Đang diễn ra': return 'success';
    case 'Sắp diễn ra': return 'info';
    case 'Đã kết thúc': return 'secondary';
    default: return 'light';
  }
};

const PromotionManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  // ✨ STATE MỚI CHO PHÂN TRANG ✨
  const [currentPage, setCurrentPage] = useState(1);
  const [displayCount, setDisplayCount] = useState(5);

  // --- LOGIC LỌC VÀ PHÂN TRANG MỚI ---
  const filteredData = mockPromotions
    .filter(promo => {
      if (statusFilter === 'Tất cả') return true;
      return promo.status === statusFilter;
    })
    .filter(promo => 
      promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredData.length / displayCount);
  const startIndex = (currentPage - 1) * displayCount;
  const endIndex = startIndex + displayCount;

  const paginatedPromotions = filteredData.slice(startIndex, endIndex);

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
              <Card.Title as="h4" className="mb-0">Quản lý Chương trình khuyến mãi</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3 align-items-center">
                <Col md={5}>
                  <Form.Group>
                    <div className="input-group">
                      <Form.Control 
                        type="text" 
                        placeholder="Tìm theo tên hoặc mã KM..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} // Reset
                      />
                      <Button variant="outline-secondary"><FaSearch /></Button>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Select 
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} // Reset
                    >
                      <option value="Tất cả">Tất cả trạng thái</option>
                      <option value="Đang diễn ra">Đang diễn ra</option>
                      <option value="Sắp diễn ra">Sắp diễn ra</option>
                      <option value="Đã kết thúc">Đã kết thúc</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex justify-content-end align-items-center">
                   <Form.Label className="me-2 mb-0">Hiển thị</Form.Label>
                   <Form.Select 
                      style={{ width: '80px' }}
                      value={displayCount}
                      onChange={(e) => { setDisplayCount(Number(e.target.value)); setCurrentPage(1); }} // Reset
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={mockPromotions.length}>Tất cả</option>
                   </Form.Select>
                  <Button as={Link} to="/admin/promotions/add" variant="primary" className="ms-3">
                    <FaPlus className="me-2" /> Thêm KM mới
                  </Button>
                </Col>
              </Row>

              <Table striped bordered hover responsive className="table-custom align-middle">
                <thead>
                  <tr>
                    <th>Tên chương trình</th>
                    <th>Mã</th>
                    <th>Loại</th>
                    <th>Giá trị</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày kết thúc</th>
                    <th className="text-center">Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {/* ✨ SỬ DỤNG DỮ LIỆU ĐÃ PHÂN TRANG ✨ */}
                  {paginatedPromotions.map((promo) => (
                    <tr key={promo.id}>
                      <td><strong>{promo.name}</strong></td>
                      <td>{promo.code}</td>
                      <td>{promo.type}</td>
                      <td>{promo.value}</td>
                      <td>{promo.startDate}</td>
                      <td>{promo.endDate}</td>
                      <td className="text-center">
                        <Badge bg={getStatusBadge(promo.status)}>
                          {promo.status}
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

export default PromotionManagementPage;