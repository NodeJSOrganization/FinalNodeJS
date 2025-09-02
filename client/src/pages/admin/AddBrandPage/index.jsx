// src/pages/admin/AddBrandPage/index.jsx
import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { FaCopyright, FaInfoCircle, FaImage } from 'react-icons/fa';

const AddBrandPage = () => {
  // State cho các trường của form
  const [brandName, setBrandName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [status, setStatus] = useState('Hoạt động');

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const brandData = {
      brandName,
      description,
      logo,
      status,
      createdAt: new Date().toISOString()
    };
    console.log("Dữ liệu thương hiệu mới:", brandData);
    alert('Thương hiệu đã được tạo! (Kiểm tra console log)');
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
                {/* Tên thương hiệu */}
                <Form.Group className="mb-3" controlId="brandName">
                  <Form.Label>Tên thương hiệu</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="VD: Logitech" 
                    required 
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </Form.Group>

                {/* Mô tả */}
                <Form.Group className="mb-3" controlId="brandDescription">
                  <Form.Label>Mô tả ngắn</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    placeholder="Mô tả về thương hiệu này..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>

                {/* Logo */}
                <Form.Group controlId="brandLogo" className="mb-3">
                  <Form.Label><FaImage className="me-2"/>Logo thương hiệu</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleLogoChange} />
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
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Tạm ẩn">Tạm ẩn</option>
                  </Form.Select>
                </Form.Group>

              </Card.Body>
              <Card.Footer className="text-end">
                <Button variant="secondary" type="button" className="me-2">Hủy</Button>
                <Button variant="primary" type="submit">Lưu thương hiệu</Button>
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