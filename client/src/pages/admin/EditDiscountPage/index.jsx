// src/pages/admin/EditDiscountPage/index.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, InputGroup, Alert } from 'react-bootstrap';
import { FaTags, FaTicketAlt, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../../../../features/ui/uiSlice';

const EditDiscountPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();

    // Form states
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('fixed_amount');
    const [value, setValue] = useState('');
    const [quantity, setQuantity] = useState('');
    const [status, setStatus] = useState('active');

    // UI states
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchDiscount = async () => {
            dispatch(showLoading());
            try {
                const { data } = await axios.get(`/api/v1/discounts/${id}`);
                const discount = data.data;
                setCode(discount.code);
                setDescription(discount.description);
                setType(discount.type);
                setValue(discount.value);
                setQuantity(discount.quantity);
                setStatus(discount.status);
            } catch (err) {
                setError('Không thể tải dữ liệu mã giảm giá.');
            } finally {
                dispatch(hideLoading());
            }
        };
        fetchDiscount();
    }, [id, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        dispatch(showLoading());

        const payload = {
            code: code.trim(),
            description: description.trim(),
            type,
            value: Number(value),
            quantity: Number(quantity),
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

            await axios.put(`/api/v1/discounts/${id}`, payload, config);

            setSuccess('Cập nhật thành công! Đang chuyển hướng...');
            setTimeout(() => navigate('/admin/discounts'), 2000);
        } catch (err) {
            console.error("Lỗi khi cập nhật mã giảm giá:", err.response || err);
            setError(err.response?.data?.msg || 'Cập nhật thất bại. Vui lòng kiểm tra lại dữ liệu đầu vào.');
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
                                <Card.Title as="h4"><FaTags className="me-2" /> Sửa Mã giảm giá</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
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
                                <Button variant="primary" type="submit">
                                    Lưu thay đổi
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