// src/pages/admin/AddBrandPage/index.jsx
import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap'; // Thêm Alert, Spinner
import { FaCopyright, FaInfoCircle, FaImage } from 'react-icons/fa';
import axios from 'axios'; // Import axios
import { useNavigate } from 'react-router-dom'; // Import useNavigate để điều hướng

const AddBrandPage = () => {
  const navigate = useNavigate(); // Khởi tạo hook

  // State cho các trường của form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [status, setStatus] = useState('active'); // <-- Sửa giá trị mặc định

  // State cho việc gọi API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      // Giải phóng URL cũ để tránh rò rỉ bộ nhớ
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!logo) {
      setError('Vui lòng chọn một logo cho thương hiệu.');
      return;
    }

    // Vì có file upload, chúng ta phải dùng FormData
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('status', status);
    formData.append('logo', logo); // 'logo' phải khớp với key trong upload.single('logo') ở backend

    try {
      setLoading(true);
      
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
        setLoading(false);
        return;
      }

      // Cấu hình headers với token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // Quan trọng cho file upload
        }
      };

      // Gọi API
      await axios.post('/api/v1/brands', formData, config);

      setSuccess('Tạo thương hiệu thành công! Đang chuyển về trang danh sách...');
      
      // Xóa form
      setName('');
      setDescription('');
      setLogo(null);
      setLogoPreview('');
      
      // Chờ 2 giây rồi chuyển về trang danh sách thương hiệu
      setTimeout(() => {
        navigate('/admin/brands');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.msg || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Row>
        <Col md={8}>
          <Form onSubmit={handleSubmit}>
            <Card className="card-custom">
              <Card.Header>
                <Card.Title as="h4"><FaCopyright className="me-2"/>Tạo Thương hiệu mới</Card.Title>
              </Card.Header>
              <Card.Body>
                {/* Hiển thị thông báo */}
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                {/* Tên thương hiệu */}
                <Form.Group className="mb-3" controlId="brandName">
                  <Form.Label>Tên thương hiệu</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="VD: Logitech" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>

                {/* Mô tả */}
                <Form.Group className="mb-3" controlId="brandDescription">
                  <Form.Label>Mô tả ngắn</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    placeholder="Mô tả về thương hiệu này..."
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>

                {/* Logo */}
                <Form.Group controlId="brandLogo" className="mb-3">
                  <Form.Label><FaImage className="me-2"/>Logo thương hiệu</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleLogoChange} required />
                </Form.Group>
                {logoPreview && (
                  <div className="image-preview-container mb-3">
                    <img src={logoPreview} alt="Xem trước logo" className="image-preview" />
                  </div>
                )}
                
                {/* Trạng thái */}
                <Form.Group className="mb-3" controlId="brandStatus">
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tạm ẩn</option>
                  </Form.Select>
                </Form.Group>

              </Card.Body>
              <Card.Footer className="text-end">
                <Button variant="secondary" type="button" className="me-2" onClick={() => navigate('/admin/brands')}>Hủy</Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      {' '}Đang lưu...
                    </>
                  ) : 'Lưu thương hiệu'}
                </Button>
              </Card.Footer>
            </Card>
          </Form>
        </Col>
        
        <Col md={4}>
          <Card className="card-custom">
            <Card.Header>
              <Card.Title as="h5"><FaInfoCircle className="me-2" />Lưu ý</Card.Title>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <p><strong>Logo thương hiệu</strong> nên là ảnh vuông, có nền trong suốt (PNG) để hiển thị đẹp nhất trên trang web.</p>
                <hr />
                <p className="mb-0">Thương hiệu ở trạng thái <strong>"Tạm ẩn"</strong> sẽ không hiển thị trong bộ lọc sản phẩm của khách hàng.</p>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddBrandPage;