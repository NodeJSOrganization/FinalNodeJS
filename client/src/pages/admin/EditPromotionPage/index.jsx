// src/pages/admin/EditPromotionPage/index.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, InputGroup, Alert, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { FaBullhorn, FaPercent, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EditPromotionPage = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Lấy ID từ URL

    // State cho các trường của form
    const [name, setName] = useState('');
    const [appliedProducts, setAppliedProducts] = useState([]);
    const [type, setType] = useState('percent');
    const [value, setValue] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // State để lưu danh sách sản phẩm từ API
    const [productOptions, setProductOptions] = useState([]);

    // State để quản lý trạng thái của component
    const [loading, setLoading] = useState(true); // Loading cho việc fetch dữ liệu ban đầu
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Lấy dữ liệu của khuyến mãi cần sửa và danh sách sản phẩm
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Gọi song song 2 API để tăng tốc độ
                const [promoRes, productsRes] = await Promise.all([
                    axios.get(`/api/v1/promotions/${id}`, config),
                    axios.get('/api/v1/products', config) // API này không cần token nhưng thêm cho nhất quán
                ]);

                // Xử lý dữ liệu sản phẩm cho react-select
                const options = productsRes.data.data.map(product => ({
                    value: product._id,
                    label: product.name
                }));
                setProductOptions(options);

                // Xử lý dữ liệu khuyến mãi và điền vào form
                const promoData = promoRes.data.data;
                setName(promoData.name);
                setType(promoData.type);
                setValue(promoData.value);
                // Format lại ngày tháng cho input type="date" (YYYY-MM-DD)
                setStartDate(new Date(promoData.startDate).toISOString().split('T')[0]);
                setEndDate(new Date(promoData.endDate).toISOString().split('T')[0]);

                // Chuyển đổi mảng ID sản phẩm thành định dạng của react-select
                const selectedProductOptions = options.filter(option =>
                    promoData.appliedProducts.includes(option.value)
                );
                setAppliedProducts(selectedProductOptions);

            } catch (err) {
                setError(err.response?.data?.msg || 'Không thể tải dữ liệu. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]); // Effect sẽ chạy lại nếu ID thay đổi

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const promotionData = {
            name,
            appliedProducts: appliedProducts.map(p => p.value),
            type,
            value: Number(value),
            startDate,
            endDate,
        };

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Gọi API PUT để cập nhật
            await axios.put(`/api/v1/promotions/${id}`, promotionData, config);

            setSuccess('Cập nhật khuyến mãi thành công! Đang chuyển hướng...');
            setTimeout(() => navigate('/admin/promotions'), 2000);

        } catch (err) {
            const message = err.response?.data?.msg || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                <Spinner animation="border" />
            </div>
        );
    }

    return (
        <div className="p-4">
            <Row>
                <Col md={8}>
                    <Form onSubmit={handleSubmit}>
                        <Card className="card-custom">
                            <Card.Header>
                                {/* Thay đổi tiêu đề */}
                                <Card.Title as="h4"><FaBullhorn className="me-2" />Chỉnh sửa Chương trình khuyến mãi</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                {error && <Alert variant="danger">{error}</Alert>}
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
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                        placeholder="Tìm và chọn sản phẩm..."
                                        value={appliedProducts}
                                        onChange={setAppliedProducts}
                                        required
                                        noOptionsMessage={() => "Không tìm thấy sản phẩm"}
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
                                            <InputGroup>
                                                <Form.Control type="number" required value={value} onChange={(e) => setValue(e.target.value)} />
                                                <InputGroup.Text>{type === 'percent' ? '%' : 'đ'}</InputGroup.Text>
                                            </InputGroup>
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

                            </Card.Body>
                            <Card.Footer className="text-end">
                                <Button variant="secondary" type="button" className="me-2" onClick={() => navigate('/admin/promotions')}>Hủy</Button>
                                <Button variant="primary" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <><Spinner as="span" animation="border" size="sm" /> Đang cập nhật...</> : 'Lưu thay đổi'}
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
export default EditPromotionPage;