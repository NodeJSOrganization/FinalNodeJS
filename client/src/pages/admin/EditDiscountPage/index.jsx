// src/pages/admin/EditDiscountPage/index.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { FaTags, FaTicketAlt, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditDiscountPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // State cho form
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('fixed_amount');
    const [value, setValue] = useState('');
    const [quantity, setQuantity] = useState('');
    const [status, setStatus] = useState('active');

    // State cho API
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchDiscount = async () => {
            try {
                const { data } = await axios.get(`/api/v1/discounts/${id}`);
                const discount = data.data;
                setCode(discount.code);
                setDescription(discount.description);
                setType(discount.type);
                setValue(discount.value);
                setQuantity(discount.quantity);
                // Định dạng lại ngày tháng để input type="date" có thể hiển thị
                setStatus(discount.status);
            } catch (err) {
                setError('Không thể tải dữ liệu mã giảm giá.');
            } finally {
                setFetchLoading(false);
            }
        };
        fetchDiscount();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // --- BƯỚC 2: CHUẨN BỊ PAYLOAD CHÍNH XÁC ---
        // Gửi đi các giá trị đã được làm sạch và đúng kiểu dữ liệu
        const payload = {
            code: code.trim(), // Loại bỏ khoảng trắng thừa
            description: description.trim(),
            type,
            value: Number(value), // Đảm bảo giá trị là kiểu Number
            quantity: Number(quantity), // Đảm bảo số lượng là kiểu Number
            status
        };

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Phiên đăng nhập đã hết hạn.");
                setLoading(false);
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            // Gửi yêu cầu PUT với payload đã được chuẩn hóa
            await axios.put(`/api/v1/discounts/${id}`, payload, config);

            setSuccess('Cập nhật thành công! Đang chuyển hướng...');
            setTimeout(() => navigate('/admin/discounts'), 2000);
        } catch (err) {
            // --- BƯỚC 3: CUNG CẤP THÔNG TIN LỖI CHI TIẾT HƠN ---
            // In lỗi ra console để debug
            console.error("Lỗi khi cập nhật mã giảm giá:", err.response || err);
            setError(err.response?.data?.msg || 'Cập nhật thất bại. Vui lòng kiểm tra lại dữ liệu đầu vào.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return <div className="text-center p-5"><Spinner /></div>;

    return (
        <div className="p-4">
            <Row>
                <Col md={8}>
                    <Form onSubmit={handleSubmit}>
                        <Card className="card-custom">
                            <Card.Header>
                                <Card.Title as="h4"><FaTags className="me-2" /> Sửa Mã giảm giá</Card.Title>
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
                                                    required
                                                    value={value}
                                                    onChange={(e) => setValue(e.target.value)}
                                                />
                                                <InputGroup.Text>{type === 'percent' ? '%' : 'VNĐ'}</InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3" controlId="quantity">
                                            <Form.Label>Số lượng</Form.Label>
                                            <Form.Control
                                                type="number"
                                                required
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                            />
                                        </Form.Group>
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
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? <><Spinner as="span" size="sm" /> Đang lưu...</> : 'Lưu thay đổi'}
                                </Button>
                            </Card.Footer>
                        </Card>
                    </Form>
                </Col>

                <Col md={4}>
                    <Card className="card-custom">
                        <Card.Header><Card.Title as="h5"><FaInfoCircle /> Hướng dẫn</Card.Title></Card.Header>
                        <Card.Body>
                            <Alert variant="info">
                                <ul className="mb-0 ps-3">
                                    <li><strong>Loại giảm giá:</strong> Chọn loại phù hợp nhất với chiến dịch của bạn.</li>
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

export default EditDiscountPage;