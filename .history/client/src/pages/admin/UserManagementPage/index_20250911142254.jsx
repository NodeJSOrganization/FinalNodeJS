// // src/pages/admin/UserManagementPage/index.jsx
// import React, { useState } from 'react';
// // ✨ IMPORT THÊM PAGINATION VÀ LINK ✨
// import { Table, Button, Badge, Card, Row, Col, Form, Image, Pagination } from 'react-bootstrap';
// import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
// import { mockUsers } from '../../../data/mockData';
// import { Link } from 'react-router-dom';

// const UserManagementPage = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   // ✨ STATE MỚI CHO PHÂN TRANG ✨
//   const [currentPage, setCurrentPage] = useState(1);
//   const [displayCount, setDisplayCount] = useState(5);

//   // --- LOGIC LỌC VÀ PHÂN TRANG MỚI ---
//   const filteredData = mockUsers
//     .filter(user => 
//       user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.email.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//   const totalPages = Math.ceil(filteredData.length / displayCount);
//   const startIndex = (currentPage - 1) * displayCount;
//   const endIndex = startIndex + displayCount;

//   const paginatedUsers = filteredData.slice(startIndex, endIndex);

//   // Hàm xử lý chuyển trang
//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   return (
//     <div className="p-4">
//       <Row className="justify-content-center">
//         <Col lg={10}>
//           <Card className="card-custom">
//             <Card.Header>
//               <Card.Title as="h4" className="mb-0">Quản lý người dùng</Card.Title>
//             </Card.Header>
//             <Card.Body>
//               <Row className="mb-3 align-items-center">
//                 <Col md={6}>
//                   <Form.Group>
//                     <div className="input-group">
//                       <Form.Control 
//                         type="text" 
//                         placeholder="Tìm theo tên hoặc email..."
//                         value={searchTerm}
//                         onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} // Reset
//                       />
//                       <Button variant="outline-secondary"><FaSearch /></Button>
//                     </div>
//                   </Form.Group>
//                 </Col>
//                 <Col md={6} className="d-flex justify-content-end align-items-center">
//                   <Form.Label className="me-2 mb-0">Hiển thị</Form.Label>
//                   <Form.Select 
//                     style={{ width: '80px' }}
//                     value={displayCount}
//                     onChange={(e) => { setDisplayCount(Number(e.target.value)); setCurrentPage(1); }} // Reset
//                   >
//                     <option value={5}>5</option>
//                     <option value={10}>10</option>
//                     <option value={mockUsers.length}>Tất cả</option>
//                   </Form.Select>
//                   <Button as={Link} to="/admin/users/add" variant="primary" className="ms-3">
//                     <FaPlus className="me-2" /> Thêm người dùng
//                   </Button>
//                 </Col>
//               </Row>

//               <Table striped bordered hover responsive className="table-custom align-middle">
//                 <thead>
//                   <tr>
//                     <th>ID</th>
//                     <th>Người dùng</th>
//                     <th>Giới tính</th>
//                     <th>Số điện thoại</th>
//                     <th>Địa chỉ</th>
//                     <th>Vai trò</th>
//                     <th>Ngày tham gia</th>
//                     <th>Hành động</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {/* ✨ SỬ DỤNG DỮ LIỆU ĐÃ PHÂN TRANG ✨ */}
//                   {paginatedUsers.map((user) => (
//                     <tr key={user.id}>
//                       <td>{user.id}</td>
//                       <td>
//                         <div className="d-flex align-items-center">
//                           <Image src={user.avatar} roundedCircle width="40" height="40" className="me-3" />
//                           <div>
//                             <strong>{user.name}</strong>
//                             <div className="text-muted">{user.email}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td>{user.gender}</td>
//                       <td>{user.phone}</td>
//                       <td>{user.address}</td>
//                       <td>
//                         <Badge bg={user.role === 'Admin' ? 'info' : 'secondary'}>
//                           {user.role}
//                         </Badge>
//                       </td>
//                       <td>{user.joinDate}</td>
//                       <td>
//                         <Button variant="warning" size="sm" className="me-2 btn-icon"><FaEdit /></Button>
//                         <Button variant="danger" size="sm" className="btn-icon"><FaTrash /></Button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>

//               {/* ✨ THÊM COMPONENT PHÂN TRANG ✨ */}
// {totalPages > 1 && (
//   <div className="d-flex justify-content-center">
//     <Pagination>
//       <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
//       {[...Array(totalPages).keys()].map(number => (
//         <Pagination.Item 
//           key={number + 1} 
//           active={number + 1 === currentPage}
//           onClick={() => handlePageChange(number + 1)}
//         >
//           {number + 1}
//         </Pagination.Item>
//       ))}
//       <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
//     </Pagination>
//   </div>
// )}
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default UserManagementPage;

import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Card, Row, Col, Form, Image, Pagination, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // State cho Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/api/v1/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(data.data);
    } catch (err) {
      setError('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/users/${userToDelete._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.filter(u => u._id !== userToDelete._id));
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Xóa người dùng thất bại.');
      setShowDeleteModal(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/v1/users', { headers: { Authorization: `Bearer ${token}` } });
      // Sau khi xóa thành công, fetch lại danh sách (chỉ còn lại admin)
      fetchUsers();
      setShowDeleteAllModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Xóa tất cả người dùng thất bại.');
      setShowDeleteAllModal(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatAddress = (addr) => {
    if (!addr || !addr.streetAddress) return 'Chưa cung cấp';
    return `${addr.streetAddress}, ${addr.ward}, ${addr.district}, ${addr.province}`;
  };

  return (
    <div className="p-4">
      <Card className="card-custom">
        <Card.Header><Card.Title as="h4" className="mb-0">Quản lý người dùng</Card.Title></Card.Header>
        <Card.Body>
          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
          <Row className="mb-3 align-items-center">
            <Col md={5}><Form.Control type="text" placeholder="Tìm theo tên hoặc email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></Col>
            <Col md={7} className="d-flex justify-content-end align-items-center">
              <Button variant="danger" className="me-auto" onClick={() => setShowDeleteAllModal(true)} disabled={users.length <= 1}><FaTrash /> Xóa tất cả</Button>
              <Form.Label className="me-2 mb-0">Hiển thị</Form.Label>
              <Form.Select style={{ width: '80px' }} value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))}>
                <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option>
              </Form.Select>
              <Button variant="primary" className="ms-3" onClick={() => navigate('/admin/users/add')}><FaPlus /> Thêm người dùng</Button>
            </Col>
          </Row>
          {loading ? <div className="text-center p-5"><Spinner /></div> : (
            <>
              <Table striped bordered hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Số điện thoại</th>
                    <th>Địa chỉ</th>
                    <th>Vai trò</th>
                    <th>Ngày tham gia</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? currentUsers.map(user => (
                    <tr key={user._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <Image src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`} roundedCircle width="40" height="40" className="me-3" />
                          <div><strong>{user.fullName}</strong><div className="text-muted">{user.email}</div></div>
                        </div>
                      </td>
                      <td>{user.phoneNumber || 'N/A'}</td>
                      <td>{formatAddress(user.address)}</td>
                      <td><Badge bg={user.role === 'admin' ? 'primary' : 'secondary'}>{user.role}</Badge></td>
                      <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <Button variant="warning" size="sm" className="me-2" onClick={() => navigate(`/admin/users/edit/${user._id}`)}><FaEdit /></Button>
                        <Button variant="danger" size="sm" onClick={() => openDeleteModal(user)}><FaTrash /></Button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="6" className="text-center">Không tìm thấy người dùng.</td></tr>}
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
      {/* Modal xóa 1 */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Xác nhận xóa</Modal.Title></Modal.Header>
        <Modal.Body>Bạn chắc chắn muốn xóa người dùng <strong>{userToDelete?.name}</strong>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xóa tất cả */}
      <Modal show={showDeleteAllModal} onHide={() => setShowDeleteAllModal(false)} centered>
        <Modal.Header closeButton><Modal.Title className="text-danger"><FaExclamationTriangle /> Cảnh báo</Modal.Title></Modal.Header>
        <Modal.Body>Bạn có chắc muốn xóa <strong>TẤT CẢ</strong> người dùng? Hành động này không thể hoàn tác.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteAllModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDeleteAll}>Tôi chắc chắn, Xóa tất cả</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagementPage;