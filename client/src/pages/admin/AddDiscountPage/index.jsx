// src/pages/admin/AddDiscountPage/index.jsx
import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, InputGroup, Alert } from 'react-bootstrap';
import { FaTags, FaTicketAlt, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../../../../features/ui/uiSlice';

const AddDiscountPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('fixed_amount');
  const [value, setValue] = useState('');
  const [quantity, setQuantity] = useState('');
  const [status, setStatus] = useState('active');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    dispatch(showLoading());

    const payload = {
      code,
      description,
      type,
      value,
      quantity,
      status
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Phiên đăng nhập đã hết hạn.");
        dispatch(hideLoading());
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post('/api/v1/discounts', payload, config);

      setSuccess('Tạo mã giảm giá thành công! Đang chuyển hướng...');
      setTimeout(() => navigate('/admin/discounts'), 2000);

    } catch (err) {
      setError(err.response?.data?.msg || 'Tạo mã giảm giá thất bại.');
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
                <Card.Title as="h4"><FaTags className="me-2" />Tạo Mã giảm giá mới</Card.Title>
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form.Group className="mb-3" controlId="code">
                  <Form.Label>Mã giảm giá</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaTicketAlt /></InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="VD: SALE50K"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="VD: Giảm 50,000đ cho đơn hàng từ 500,000đ"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="type">
                      <Form.Label>Loại giảm giá</Form.Label>
                      <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="fixed_amount">Giảm tiền mặt</option>
                        <option value="percent">Giảm theo %</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="value">
                      <Form.Label>Giá trị</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="number"
                          placeholder={type === 'percent' ? "15" : "50000"}
                          required
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                        />
                        <InputGroup.Text>
                          {type === 'percent' ? '%' : 'VNĐ'}
                        </InputGroup.Text>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Col md={4}>
                      <Form.Group className="mb-3" controlId="quantity">
                        <Form.Label>Số lượng</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Tối đa 10"
                          required
                          min="1"
                          max="10" // 1. Thêm thuộc tính max HTML5
                          value={quantity}
                          onChange={(e) => {
                            const val = e.target.value;

                            // 2. Logic kiểm tra:
                            // Nếu xóa hết (rỗng) thì cho phép
                            if (val === '') {
                              setQuantity('');
                            }
                            // Nếu nhập số > 10 thì ép về 10
                            else if (parseInt(val) > 10) {
                              setQuantity('10');
                            }
                            // Các trường hợp còn lại (<= 10) thì set bình thường
                            else {
                              setQuantity(val);
                            }
                          }}
                        />
                        {/* Thêm dòng chú thích nhỏ cho người dùng biết */}
                        <Form.Text className="text-muted">
                          Giới hạn tối đa 10 mã.
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="status">
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </Form.Select>
                </Form.Group>
              </Card.Body>
              <Card.Footer className="text-end">
                <Button variant="secondary" type="button" className="me-2" onClick={() => navigate('/admin/discounts')}>Hủy</Button>
                <Button variant="primary" type="submit">
                  Lưu mã giảm giá
                </Button>
              </Card.Footer>
            </Card>
          </Form>
        </Col>

        <Col md={4}>
          <Card className="card-custom">
            <Card.Header>
              <Card.Title as="h5"><FaInfoCircle className="me-2" />Hướng dẫn</Card.Title>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <ul className="mb-0 ps-3">
                  <li><strong>Loại giảm giá:</strong> Chọn loại phù hợp nhất với chiến dịch của bạn.</li>
                  <li><strong>Số lượng:</strong> Tổng số lần mã này có thể được sử dụng.</li>
                </ul>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddDiscountPage;