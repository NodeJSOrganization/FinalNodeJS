// src/pages/admin/AddPromotionPage/index.jsx
import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, InputGroup, Alert } from 'react-bootstrap';
import Select from 'react-select'; // ✨ IMPORT THƯ VIỆN MỚI ✨
import { FaBullhorn, FaPercent, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import { mockProducts } from '../../../data/mockData'; // ✨ LẤY DANH SÁCH SẢN PHẨM ✨

const AddPromotionPage = () => {
    // State cho các trường của form
    const [promoName, setPromoName] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]); // ✨ STATE MỚI: Lưu trữ sản phẩm được chọn ✨
    const [promoType, setPromoType] = useState('percent');
    const [promoValue, setPromoValue] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Chuẩn bị dữ liệu cho react-select
    const productOptions = mockProducts.map(product => ({
        value: product.id,
        label: `${product.name} (ID: ${product.id})`
    }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const promotionData = {
            promoName,
            appliedProductIds: selectedProducts.map(p => p.value), // Lấy ra danh sách ID sản phẩm
            promoType,
            promoValue,
            startDate,
            endDate,
            createdAt: new Date().toISOString()
        };
        console.log("Dữ liệu khuyến mãi mới:", promotionData);
        alert('Chương trình khuyến mãi đã được tạo! (Kiểm tra console log)');
    };

    return (
        <div className="p-4">
            <Row>
                <Col md={8}>
                    <Form onSubmit={handleSubmit}>
                        <Card className="card-custom">
                            <Card.Header>
                                <Card.Title as="h4"><FaBullhorn className="me-2" />Tạo Chương trình khuyến mãi mới</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                {/* Tên chương trình */}
                                <Form.Group className="mb-3" controlId="promoName">
                                    <Form.Label>Tên chương trình</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="VD: Giảm giá sốc cho Laptop"
                                        required
                                        value={promoName}
                                        onChange={(e) => setPromoName(e.target.value)}
                                    />
                                </Form.Group>

                                {/* ✨ THAY THẾ MÃ KHUYẾN MÃI BẰNG Ô CHỌN SẢN PHẨM ✨ */}
                                <Form.Group className="mb-3" controlId="selectProducts">
                                    <Form.Label>Áp dụng cho sản phẩm</Form.Label>
                                    <Select
                                        isMulti // Cho phép chọn nhiều
                                        options={productOptions}
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                        placeholder="Tìm và chọn sản phẩm..."
                                        value={selectedProducts}
                                        onChange={setSelectedProducts}
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        Chọn một hoặc nhiều sản phẩm để áp dụng khuyến mãi này.
                                    </Form.Text>
                                </Form.Group>

                                <Row>
                                    {/* Loại khuyến mãi */}
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="promoType">
                                            <Form.Label>Loại khuyến mãi</Form.Label>
                                            <Form.Select
                                                value={promoType}
                                                onChange={(e) => setPromoType(e.target.value)}
                                            >
                                                <option value="percent">Giảm giá theo %</option>
                                                <option value="fixed">Giảm giá tiền mặt</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    {/* Giá trị */}
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="promoValue">
                                            <Form.Label>Giá trị</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    type="number"
                                                    placeholder={promoType === 'percent' ? "VD: 15" : "VD: 100000"}
                                                    required
                                                    value={promoValue}
                                                    onChange={(e) => setPromoValue(e.target.value)}
                                                />
                                                <InputGroup.Text>
                                                    {promoType === 'percent' ? '%' : 'đ'}
                                                </InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    {/* Ngày bắt đầu */}
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="startDate">
                                            <Form.Label>Ngày bắt đầu</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    type="date"
                                                    required
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                />
                                                <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    {/* Ngày kết thúc */}
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="endDate">
                                            <Form.Label>Ngày kết thúc</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    type="date"
                                                    required
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                />
                                                <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>

                            </Card.Body>
                            <Card.Footer className="text-end">
                                <Button variant="secondary" type="button" className="me-2">Hủy</Button>
                                <Button variant="primary" type="submit">Lưu chương trình</Button>
                            </Card.Footer>
                        </Card>
                    </Form>
                </Col>

                {/* CỘT PHẢI: HƯỚNG DẪN / GỢI Ý */}
                <Col md={4}>
                    <Card className="card-custom">
                        <Card.Header>
                            <Card.Title as="h5"><FaInfoCircle className="me-2" />Lưu ý</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Alert variant="info">
                                <ul className="mb-0 ps-3">
                                    <li>Chọn các sản phẩm cụ thể từ danh sách để áp dụng khuyến mãi.</li>
                                    <li>Giá của các sản phẩm được chọn sẽ được tự động giảm khi chương trình có hiệu lực.</li>
                                    <li>Chương trình sẽ tự động kích hoạt vào <strong>00:00</strong> ngày bắt đầu và kết thúc vào <strong>23:59</strong> ngày kết thúc.</li>
                                </ul>
                            </Alert>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddPromotionPage;