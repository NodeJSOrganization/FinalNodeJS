// src/pages/admin/AddBrandPage/index.jsx
import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { FaCopyright, FaInfoCircle, FaImage } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../../../../features/ui/uiSlice';

const AddBrandPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [status, setStatus] = useState('active');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
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

    dispatch(showLoading());

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('status', status);
    formData.append('logo', logo);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
        dispatch(hideLoading());
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      await axios.post('/api/v1/brands', formData, config);

      setSuccess('Tạo thương hiệu thành công! Đang chuyển về trang danh sách...');
      
      setName('');
      setDescription('');
      setLogo(null);
      setLogoPreview('');
      
      setTimeout(() => {
        navigate('/admin/brands');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.msg || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      dispatch(hideLoading());
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
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

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

                <Form.Group controlId="brandLogo" className="mb-3">
                  <Form.Label><FaImage className="me-2"/>Logo thương hiệu</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleLogoChange} required />
                </Form.Group>
                {logoPreview && (
                  <div className="image-preview-container mb-3">
                    <img src={logoPreview} alt="Xem trước logo" className="image-preview" />
                  </div>
                )}
                
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
                <Button variant="primary" type="submit">
                  Lưu thương hiệu
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