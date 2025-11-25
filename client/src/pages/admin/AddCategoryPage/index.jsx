// src/pages/admin/AddCategoryPage/index.jsx
import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { FaSitemap, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../../../../features/ui/uiSlice';

const AddCategoryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    dispatch(showLoading());

    const payload = {
      name,
      description,
      status,
    };

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
        }
      };

      await axios.post('/api/v1/categories', payload, config);

      setSuccess('Tạo danh mục thành công! Đang chuyển về trang danh sách...');

      setName('');
      setDescription('');
      setStatus('active');

      setTimeout(() => {
        navigate('/admin/categories');
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
                <Card.Title as="h4"><FaSitemap className="me-2" />Tạo Danh mục mới</Card.Title>
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form.Group className="mb-3" controlId="categoryName">
                  <Form.Label>Tên danh mục</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: Laptop Gaming"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="categoryDescription">
                  <Form.Label>Mô tả ngắn</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Mô tả về danh mục này..."
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="categoryStatus">
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
                <Button variant="secondary" type="button" className="me-2" onClick={() => navigate('/admin/categories')}>Hủy</Button>
                <Button variant="primary" type="submit">
                  Lưu danh mục
                </Button>
              </Card.Footer>
            </Card>
          </Form>
        </Col>

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