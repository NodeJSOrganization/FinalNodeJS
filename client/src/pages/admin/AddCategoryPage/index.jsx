// src/pages/admin/AddCategoryPage/index.jsx
import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { FaSitemap, FaInfoCircle } from 'react-icons/fa';

const AddCategoryPage = () => {
  // State cho các trường của form
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Hoạt động'); // Mặc định là 'Hoạt động'

  const handleSubmit = (e) => {
    e.preventDefault();
    const categoryData = {
      categoryName,
      description,
      status,
      createdAt: new Date().toISOString()
    };
    console.log("Dữ liệu danh mục mới:", categoryData);
    alert('Danh mục đã được tạo! (Kiểm tra console log)');
  };

  return (
    <div className="p-4">
      <Row>
        <Col md={8}>
          <Form onSubmit={handleSubmit}>
            <Card className="card-custom">
              <Card.Header>
                <Card.Title as="h4"><FaSitemap className="me-2"/>Tạo Danh mục mới</Card.Title>
              </Card.Header>
              <Card.Body>
                {/* Tên danh mục */}
                <Form.Group className="mb-3" controlId="categoryName">
                  <Form.Label>Tên danh mục</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="VD: Laptop Gaming" 
                    required 
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                </Form.Group>

                {/* Mô tả */}
                <Form.Group className="mb-3" controlId="categoryDescription">
                  <Form.Label>Mô tả ngắn</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    placeholder="Mô tả về danh mục này..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>
                
                {/* Trạng thái */}
                <Form.Group className="mb-3" controlId="categoryStatus">
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
                <Button variant="primary" type="submit">Lưu danh mục</Button>
              </Card.Footer>
            </Card>
          </Form>
        </Col>
        
        {/* CỘT PHẢI: HƯỚNG DẪN / GỢI Ý */}
        <Col md={4}>
          <Card className="card-custom">
            <Card.Header>
              <Card.Title as="h5"><FaInfoCircle className="me-2" />Thông tin thêm</Card.Title>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <p><strong>Trạng thái "Hoạt động":</strong></p>
                <p className="mb-0">Danh mục sẽ được hiển thị cho khách hàng và có thể thêm sản phẩm vào.</p>
              </Alert>
              <Alert variant="warning">
                <p><strong>Trạng thái "Tạm ẩn":</strong></p>
                <p className="mb-0">Danh mục sẽ bị ẩn khỏi trang web của khách hàng. Các sản phẩm thuộc danh mục này cũng có thể bị ảnh hưởng.</p>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddCategoryPage;