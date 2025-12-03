// // src/pages/admin/CategoryListPage/index.jsx
// import React, { useState } from 'react';
// // ✨ IMPORT THÊM PAGINATION ✨
// import { Table, Button, Badge, Card, Row, Col, Form, Pagination } from 'react-bootstrap';
// import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
// import { mockCategories } from '../../../data/mockData';

// const CategoryListPage = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   // ✨ STATE MỚI CHO PHÂN TRANG ✨
//   const [currentPage, setCurrentPage] = useState(1);
//   const [displayCount, setDisplayCount] = useState(5); // Số lượng hiển thị mỗi trang

//   // --- LOGIC LỌC VÀ PHÂN TRANG MỚI ---
//   const filteredData = mockCategories.filter(cat => 
//     cat.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const totalPages = Math.ceil(filteredData.length / displayCount);
//   const startIndex = (currentPage - 1) * displayCount;
//   const endIndex = startIndex + displayCount;

//   const paginatedCategories = filteredData.slice(startIndex, endIndex);

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
//               <Card.Title as="h4" className="mb-0">Quản lý Danh mục</Card.Title>
//             </Card.Header>
//             <Card.Body>
//               <Row className="mb-3 align-items-center">
//                 <Col md={6}>
//                   <Form.Group>
//                     <div className="input-group" style={{ maxWidth: '400px' }}>
//                       <Form.Control 
//                         type="text" 
//                         placeholder="Tìm theo tên danh mục..."
//                         value={searchTerm}
//                         onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} // Reset về trang 1
//                       />
//                       <Button variant="outline-secondary"><FaSearch /></Button>
//                     </div>
//                   </Form.Group>
//                 </Col>
//                 <Col md={6} className="d-flex justify-content-end align-items-center">
//                    <Form.Label className="me-2 mb-0">Hiển thị</Form.Label>
//                    <Form.Select 
//                       style={{ width: '80px' }}
//                       value={displayCount}
//                       onChange={(e) => { setDisplayCount(Number(e.target.value)); setCurrentPage(1); }} // Reset về trang 1
//                     >
//                       <option value={5}>5</option>
//                       <option value={10}>10</option>
//                       <option value={mockCategories.length}>Tất cả</option>
//                    </Form.Select>
//                   <Button variant="primary" className="ms-3">
//                     <FaPlus className="me-2" /> Thêm danh mục
//                   </Button>
//                 </Col>
//               </Row>

//               <Table striped bordered hover responsive className="table-custom align-middle">
//                 <thead>
//                   <tr>
//                     <th>ID</th>
//                     <th>Tên danh mục</th>
//                     <th className="text-center">Số sản phẩm</th>
//                     <th className="text-center">Trạng thái</th>
//                     <th>Hành động</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {/* ✨ SỬ DỤNG DỮ LIỆU ĐÃ PHÂN TRANG ✨ */}
//                   {paginatedCategories.map((cat) => (
//                     <tr key={cat.id}>
//                       <td>{cat.id}</td>
//                       <td><strong>{cat.name}</strong></td>
//                       <td className="text-center">{cat.productCount}</td>
//                       <td className="text-center">
//                         <Badge bg={cat.status === 'Hoạt động' ? 'success' : 'secondary'}>
//                           {cat.status}
//                         </Badge>
//                       </td>
//                       <td>
//                         <Button variant="warning" size="sm" className="me-2 btn-icon"><FaEdit /></Button>
//                         <Button variant="danger" size="sm" className="btn-icon"><FaTrash /></Button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>

//               {/* ✨ THÊM COMPONENT PHÂN TRANG ✨ */}
//               {totalPages > 1 && (
//                 <div className="d-flex justify-content-center">
// <Pagination>
//   <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
//   {[...Array(totalPages).keys()].map(number => (
//     <Pagination.Item 
//       key={number + 1} 
//       active={number + 1 === currentPage}
//       onClick={() => handlePageChange(number + 1)}
//     >
//       {number + 1}
//     </Pagination.Item>
//   ))}
//   <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
// </Pagination>
//                 </div>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default CategoryListPage;


// src/pages/admin/CategoryListPage/index.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Card, Row, Col, Form, Pagination, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CategoryListPage = () => {
  const navigate = useNavigate();

  // State chính
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State phụ
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // State cho các modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Lấy dữ liệu từ API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('/api/v1/categories');
      setCategories(data.data);
    } catch (err) {
      setError('Không thể tải dữ liệu danh mục.');
    } finally {
      setLoading(false);
    }
  };

  // Logic lọc và phân trang
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const currentCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Xử lý xóa 1 danh mục
  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/categories/${categoryToDelete._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(categories.filter(c => c._id !== categoryToDelete._id));
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Xóa thất bại.');
      setShowDeleteModal(false);
    }
  };

  // Xử lý xóa tất cả
  const handleDeleteAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/v1/categories', { headers: { Authorization: `Bearer ${token}` } });
      setCategories([]);
      setShowDeleteAllModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Xóa tất cả thất bại.');
      setShowDeleteAllModal(false);
    }
  };

  return (
    <div className="p-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="card-custom">
            <Card.Header>
              <Card.Title as="h4" className="mb-0">Quản lý Danh mục</Card.Title>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

              <Row className="mb-3 align-items-center">
                <Col md={4}>
                  <Form.Control type="text" placeholder="Tìm theo tên..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                </Col>
                <Col md={8} className="d-flex justify-content-end align-items-center">
                  <Button variant="danger" className="me-auto" onClick={() => setShowDeleteAllModal(true)} disabled={categories.length === 0}>
                    <FaTrash className="me-2" /> Xóa tất cả
                  </Button>
                  <Form.Label className="me-2 mb-0">Hiển thị</Form.Label>
                  <Form.Select style={{ width: '80px' }} value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={categories.length}>Tất cả</option>
                  </Form.Select>
                  <Button variant="primary" className="ms-3" onClick={() => navigate('/admin/categories/add')}>
                    <FaPlus className="me-2" /> Thêm mới
                  </Button>
                </Col>
              </Row>

              {loading ? (
                <div className="text-center"><Spinner /></div>
              ) : (
                <>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Tên danh mục</th>
                        <th>Mô tả</th>
                        <th className="text-center">Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCategories.length > 0 ? currentCategories.map((cat, index) => (
                        <tr key={cat._id}>
                          <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td><strong>{cat.name}</strong></td>
                          <td>{cat.description.substring(0, 50)}{cat.description.length > 50 && '...'}</td>
                          <td className="text-center">
                            <Badge bg={cat.status === 'active' ? 'success' : 'secondary'}>
                              {cat.status === 'active' ? 'Hoạt động' : 'Tạm ẩn'}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="warning" size="sm" className="me-2" onClick={() => navigate(`/admin/categories/edit/${cat._id}`)}>
                              <FaEdit />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => openDeleteModal(cat)}>
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="5" className="text-center">Không có danh mục nào.</td></tr>
                      )}
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
        </Col>
      </Row>

      {/* Modal xóa 1 */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Xác nhận xóa</Modal.Title></Modal.Header>
        <Modal.Body>Bạn có chắc muốn xóa danh mục <strong>{categoryToDelete?.name}</strong>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xóa tất cả */}
      <Modal show={showDeleteAllModal} onHide={() => setShowDeleteAllModal(false)} centered>
        <Modal.Header closeButton><Modal.Title className="text-danger"><FaExclamationTriangle /> Cảnh báo</Modal.Title></Modal.Header>
        <Modal.Body>Bạn có chắc muốn xóa <strong>TẤT CẢ</strong> danh mục? Hành động này không thể hoàn tác.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteAllModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDeleteAll}>Tôi chắc chắn, Xóa tất cả</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CategoryListPage;