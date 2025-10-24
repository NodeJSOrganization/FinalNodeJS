// src/pages/admin/EditPromotionPage.jsx

import React, { useState, useEffect, forwardRef } from 'react';
import { Form, Button, Card, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import { FaBullhorn, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../../../../features/ui/uiSlice';

const CustomDateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
    <InputGroup onClick={onClick} ref={ref}>
        <Form.Control value={value} placeholder={placeholder} readOnly />
        <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
    </InputGroup>
));

const EditPromotionPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();

    // Form states
    const [name, setName] = useState('');
    const [appliedProducts, setAppliedProducts] = useState([]);
    const [type, setType] = useState('percent');
    const [value, setValue] = useState('');
    const [status, setStatus] = useState('active');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Data state
    const [productOptions, setProductOptions] = useState([]);

    // UI states
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            dispatch(showLoading());
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [promoRes, productsRes] = await Promise.all([
                    axios.get(`/api/v1/promotions/${id}`, config),
                    axios.get('/api/v1/products')
                ]);

                const options = productsRes.data.data.map(product => ({
                    value: product._id,
                    label: product.name
                }));
                setProductOptions(options);

                const promoData = promoRes.data.data;
                setName(promoData.name);
                setType(promoData.type);
                setValue(promoData.value);
                setStatus(promoData.status);
                setStartDate(new Date(promoData.startDate));
                setEndDate(new Date(promoData.endDate));

                const selectedProductOptions = promoData.appliedProducts
                    .map(productId => options.find(option => option.value === productId))
                    .filter(Boolean);
                setAppliedProducts(selectedProductOptions);

            } catch (err) {
                setError(err.response?.data?.msg || 'Không thể tải dữ liệu. Vui lòng thử lại.');
            } finally {
                dispatch(hideLoading());
            }
        };
        fetchData();
    }, [id, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!startDate || !endDate) {
            return setError('Vui lòng chọn ngày bắt đầu và ngày kết thúc.');
        }
        if (appliedProducts.length === 0) {
            return setError('Vui lòng chọn ít nhất một sản phẩm.');
        }
        if (endDate < startDate) {
            return setError('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.');
        }

        dispatch(showLoading());

        const promotionData = {
            name,
            appliedProducts: appliedProducts.map(p => p.value),
            type,
            value: Number(value),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            status,
        };

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`/api/v1/promotions/${id}`, promotionData, config);
            setSuccess('Cập nhật khuyến mãi thành công! Đang chuyển hướng...');
            setTimeout(() => navigate('/admin/promotions'), 2000);
        } catch (err) {
            const message = err.response?.data?.msg || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
            setError(message);
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
                                <Card.Title as="h4"><FaBullhorn className="me-2" />Chỉnh sửa Chương trình khuyến mãi</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                                {success && <Alert variant="success">{success}</Alert>}

                                <Form.Group className="mb-3" controlId="promoName">
                                    <Form.Label>Tên chương trình</Form.Label>
                                    <Form.Control type="text" required value={name} onChange={(e) => setName(e.target.value)} />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="selectProducts">
                                    <Form.Label>Áp dụng cho sản phẩm</Form.Label>
                                    <Select
                                        isMulti
                                        options={productOptions}
                                        placeholder="Tìm và chọn sản phẩm..."
                                        value={appliedProducts}
                                        onChange={setAppliedProducts}
                                        noOptionsMessage={() => "Không tìm thấy sản phẩm"}
                                        isLoading={productOptions.length === 0 && !error}
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="promoType">
                                            <Form.Label>Loại khuyến mãi</Form.Label>
                                            <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                                                <option value="percent">Giảm giá theo %</option>
                                                <option value="fixed_amount">Giảm giá tiền mặt</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="promoValue">
                                            <Form.Label>Giá trị</Form.Label>
                                            <Form.Control type="number" required min="0" value={value} onChange={(e) => setValue(e.target.value)} />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="startDate">
                                            <Form.Label>Ngày bắt đầu</Form.Label>
                                            <DatePicker
                                                selected={startDate}
                                                onChange={(date) => setStartDate(date)}
                                                selectsStart
                                                startDate={startDate}
                                                endDate={endDate}
                                                dateFormat="dd/MM/yyyy"
                                                autoComplete="off"
                                                required
                                                customInput={<CustomDateInput placeholder="Chọn ngày bắt đầu" />}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="endDate">
                                            <Form.Label>Ngày kết thúc</Form.Label>
                                            <DatePicker
                                                selected={endDate}
                                                onChange={(date) => setEndDate(date)}
                                                selectsEnd
                                                startDate={startDate}
                                                endDate={endDate}
                                                minDate={startDate}
                                                dateFormat="dd/MM/yyyy"
                                                autoComplete="off"
                                                required
                                                customInput={<CustomDateInput placeholder="Chọn ngày kết thúc" />}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Trạng thái</Form.Label>
                                    <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                    </Form.Select>
                                </Form.Group>

                            </Card.Body>
                            <Card.Footer className="text-end">
                                <Button variant="secondary" type="button" className="me-2" onClick={() => navigate('/admin/promotions')}>Hủy</Button>
                                <Button variant="primary" type="submit">
                                    Lưu thay đổi
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
                                <ul className="mb-0 ps-3">
                                    <li>Bạn có thể thay đổi danh sách sản phẩm được áp dụng khuyến mãi.</li>
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
export default EditPromotionPage;