// src/pages/admin/UserManagementPage/index.jsx
import React, { useState } from 'react';
// ✨ IMPORT THÊM PAGINATION VÀ LINK ✨
import { Table, Button, Badge, Card, Row, Col, Form, Image, Pagination } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { mockUsers } from '../../../data/mockData';
import { Link } from 'react-router-dom';

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // ✨ STATE MỚI CHO PHÂN TRANG ✨
  const [currentPage, setCurrentPage] = useState(1);
  const [displayCount, setDisplayCount] = useState(5);

  // --- LOGIC LỌC VÀ PHÂN TRANG MỚI ---
  const filteredData = mockUsers
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredData.length / displayCount);
  const startIndex = (currentPage - 1) * displayCount;
  const endIndex = startIndex + displayCount;

  const paginatedUsers = filteredData.slice(startIndex, endIndex);
  
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
              <Card.Title as="h4" className="mb-0">Quản lý người dùng</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3 align-items-center">
                <Col md={6}>
                  <Form.Group>
                    <div className="input-group">
                      <Form.Control 
                        type="text" 
                        placeholder="Tìm theo tên hoặc email..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} // Reset
                      />
                      <Button variant="outline-secondary"><FaSearch /></Button>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6} className="d-flex justify-content-end align-items-center">
                  <Form.Label className="me-2 mb-0">Hiển thị</Form.Label>
                  <Form.Select 
                    style={{ width: '80px' }}
                    value={displayCount}
                    onChange={(e) => { setDisplayCount(Number(e.target.value)); setCurrentPage(1); }} // Reset
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={mockUsers.length}>Tất cả</option>
                  </Form.Select>
                  <Button as={Link} to="/admin/users/add" variant="primary" className="ms-3">
                    <FaPlus className="me-2" /> Thêm người dùng
                  </Button>
                </Col>
              </Row>

              <Table striped bordered hover responsive className="table-custom align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Người dùng</th>
                    <th>Giới tính</th>
                    <th>Số điện thoại</th>
                    <th>Địa chỉ</th>
                    <th>Vai trò</th>
                    <th>Ngày tham gia</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {/* ✨ SỬ DỤNG DỮ LIỆU ĐÃ PHÂN TRANG ✨ */}
                  {paginatedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Image src={user.avatar} roundedCircle width="40" height="40" className="me-3" />
                          <div>
                            <strong>{user.name}</strong>
                            <div className="text-muted">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.gender}</td>
                      <td>{user.phone}</td>
                      <td>{user.address}</td>
                      <td>
                        <Badge bg={user.role === 'Admin' ? 'info' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td>{user.joinDate}</td>
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

export default UserManagementPage;