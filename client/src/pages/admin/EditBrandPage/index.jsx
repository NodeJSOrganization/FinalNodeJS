// src/pages/admin/EditBrandPage/index.jsx

import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaCopyright, FaInfoCircle, FaImage } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditBrandPage = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Lấy ID của thương hiệu từ URL

    // State cho các trường của form
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [logo, setLogo] = useState(null); // File logo mới
    const [logoPreview, setLogoPreview] = useState(''); // Xem trước logo
    const [status, setStatus] = useState('active');

    // State cho việc gọi API
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true); // State loading cho việc lấy dữ liệu ban đầu
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Lấy dữ liệu thương hiệu cần sửa khi component được mount
    useEffect(() => {
        const fetchBrand = async () => {
            try {
                const { data } = await axios.get(`/api/v1/brands/${id}`);
                setName(data.data.name);
                setDescription(data.data.description);
                setStatus(data.data.status);
                setLogoPreview(data.data.logo); // Hiển thị logo cũ
                setFetchLoading(false);
            } catch (err) {
                setError('Không tìm thấy thương hiệu hoặc đã có lỗi xảy ra.');
                setFetchLoading(false);
            }
        };
        fetchBrand();
    }, [id]);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            if (logoPreview) URL.revokeObjectURL(logoPreview);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('status', status);
        if (logo) { // Chỉ thêm logo vào form data nếu người dùng chọn file mới
            formData.append('logo', logo);
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Phiên đăng nhập hết hạn.");
                setLoading(false);
                return;
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            // Gửi yêu cầu PUT thay vì POST
            await axios.put(`/api/v1/brands/${id}`, formData, config);

            setSuccess('Cập nhật thương hiệu thành công! Đang chuyển về trang danh sách...');
            setTimeout(() => {
                navigate('/admin/brands');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.msg || 'Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return <div className="text-center p-4"><Spinner animation="border" /></div>;
    }

    return (
        <div className="p-4">
            <Row>
                <Col md={8}>
                    <Form onSubmit={handleSubmit}>
                        <Card className="card-custom">
                            <Card.Header>
                                <Card.Title as="h4"><FaCopyright className="me-2" />Sửa Thương hiệu</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                {error && <Alert variant="danger">{error}</Alert>}
                                {success && <Alert variant="success">{success}</Alert>}

                                <Form.Group className="mb-3" controlId="brandName">
                                    <Form.Label>Tên thương hiệu</Form.Label>
                                    <Form.Control type="text" required value={name} onChange={(e) => setName(e.target.value)} />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="brandDescription">
                                    <Form.Label>Mô tả ngắn</Form.Label>
                                    <Form.Control as="textarea" rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} />
                                </Form.Group>

                                <Form.Group controlId="brandLogo" className="mb-3">
                                    <Form.Label><FaImage className="me-2" />Logo mới (để trống nếu không muốn thay đổi)</Form.Label>
                                    <Form.Control type="file" accept="image/*" onChange={handleLogoChange} />
                                </Form.Group>
                                {logoPreview && (
                                    <div className="image-preview-container mb-3">
                                        <img src={logoPreview} alt="Xem trước logo" className="image-preview" />
                                    </div>
                                )}

                                <Form.Group className="mb-3" controlId="brandStatus">
                                    <Form.Label>Trạng thái</Form.Label>
                                    <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Tạm ẩn</option>
                                    </Form.Select>
                                </Form.Group>
                            </Card.Body>
                            <Card.Footer className="text-end">
                                <Button variant="secondary" type="button" className="me-2" onClick={() => navigate('/admin/brands')}>Hủy</Button>
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Lưu thay đổi'}
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

export default EditBrandPage;