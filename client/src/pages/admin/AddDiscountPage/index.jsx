// src/pages/admin/AddDiscountPage/index.jsx
import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, InputGroup, Alert } from 'react-bootstrap';
import { FaTags, FaTicketAlt, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';

const AddDiscountPage = () => {
  // State cho các trường của form
  const [promoCode, setPromoCode] = useState('');
  const [description, setDescription] = useState('');
  const [promoType, setPromoType] = useState('percent'); // 'percent', 'fixed', 'free_shipping'
  const [promoValue, setPromoValue] = useState('');
  const [quantity, setQuantity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('Hoạt động');

  const handleSubmit = (e) => {
    e.preventDefault();
    const discountData = {
      promoCode,
      description,
      promoType,
      promoValue: promoType === 'free_shipping' ? 'Free' : promoValue, // Xử lý cho free shipping
      quantity,
      startDate,
      endDate,
      status,
      createdAt: new Date().toISOString()
    };
    console.log("Dữ liệu mã giảm giá mới:", discountData);
    alert('Mã giảm giá đã được tạo! (Kiểm tra console log)');
  };

  return (
    <div className="p-4">
      <Row>
        <Col md={8}>
          <Form onSubmit={handleSubmit}>
            <Card className="card-custom">
              <Card.Header>
                <Card.Title as="h4"><FaTags className="me-2"/>Tạo Mã giảm giá mới</Card.Title>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3" controlId="promoCode">
                  <Form.Label>Mã giảm giá</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaTicketAlt /></InputGroup.Text>
                    <Form.Control 
                      type="text" 
                      placeholder="VD: SALE50K" 
                      required 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3" controlId="promoDescription">
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
                    <Form.Group className="mb-3" controlId="promoType">
                      <Form.Label>Loại giảm giá</Form.Label>
                      <Form.Select value={promoType} onChange={(e) => setPromoType(e.target.value)}>
                        <option value="percent">Giảm theo %</option>
                        <option value="fixed">Giảm tiền mặt</option>
                        <option value="free_shipping">Miễn phí vận chuyển</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="promoValue">
                      <Form.Label>Giá trị</Form.Label>
                      <InputGroup>
                        <Form.Control 
                          type="number" 
                          placeholder={promoType === 'percent' ? "15" : "50000"}
                          value={promoValue}
                          onChange={(e) => setPromoValue(e.target.value)}
                          disabled={promoType === 'free_shipping'} // Vô hiệu hóa khi là free shipping
                          required={promoType !== 'free_shipping'}
                        />
                        <InputGroup.Text>
                          {promoType === 'percent' ? '%' : 'đ'}
                        </InputGroup.Text>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                     <Form.Group className="mb-3" controlId="quantity">
                      <Form.Label>Số lượng</Form.Label>
                      <Form.Control 
                        type="number" 
                        placeholder="VD: 100" 
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="startDate">
                      <Form.Label>Ngày bắt đầu</Form.Label>
                      <Form.Control type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="endDate">
                      <Form.Label>Ngày kết thúc</Form.Label>
                      <Form.Control type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </Form.Group>
                  </Col>
                </Row>
                
                 <Form.Group className="mb-3" controlId="status">
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Không hoạt động">Không hoạt động</option>
                  </Form.Select>
                </Form.Group>
              </Card.Body>
              <Card.Footer className="text-end">
                <Button variant="secondary" type="button" className="me-2">Hủy</Button>
                <Button variant="primary" type="submit">Lưu mã giảm giá</Button>
              </Card.Footer>
            </Card>
          </Form>
        </Col>
        
        <Col md={4}>
          <Card className="card-custom">
            <Card.Header>
              <Card.Title as="h5"><FaInfoCircle className="me-2"/>Hướng dẫn</Card.Title>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <ul className="mb-0 ps-3">
                  <li><strong>Loại giảm giá:</strong> Chọn loại phù hợp nhất với chiến dịch của bạn.</li>
                  <li><strong>Giá trị:</strong> Nếu chọn "Miễn phí vận chuyển", ô giá trị sẽ tự động bị vô hiệu hóa.</li>
                  <li><strong>Số lượng:</strong> Tổng số lần mã này có thể được sử dụng.</li>
                  <li>Mã sẽ có hiệu lực từ <strong>00:00</strong> ngày bắt đầu đến <strong>23:59</strong> ngày kết thúc.</li>
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