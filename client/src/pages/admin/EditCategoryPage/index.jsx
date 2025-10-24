// src/pages/admin/EditCategoryPage/index.jsx

import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { FaSitemap, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../../../../features/ui/uiSlice';

const EditCategoryPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();

    // Form states
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('active');

    // UI states
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchCategory = async () => {
            dispatch(showLoading());
            try {
                const { data } = await axios.get(`/api/v1/categories/${id}`);
                setName(data.data.name);
                setDescription(data.data.description);
                setStatus(data.data.status);
            } catch (err) {
                setError('Không tìm thấy danh mục hoặc đã có lỗi xảy ra.');
                navigate('/admin/categories'); // Chuyển hướng nếu không tìm thấy
            } finally {
                dispatch(hideLoading());
            }
        };
        fetchCategory();
    }, [id, dispatch, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        dispatch(showLoading());

        const payload = { name, description, status };

        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/v1/categories/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Cập nhật danh mục thành công! Đang chuyển về trang danh sách...');
            setTimeout(() => navigate('/admin/categories'), 2000);

        } catch (err) {
            setError(err.response?.data?.msg || 'Cập nhật thất bại.');
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
                                <Card.Title as="h4"><FaSitemap className="me-2" />Sửa Danh mục</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                                {success && <Alert variant="success">{success}</Alert>}

                                <Form.Group className="mb-3">
                                    <Form.Label>Tên danh mục</Form.Label>
                                    <Form.Control type="text" required value={name} onChange={(e) => setName(e.target.value)} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Mô tả ngắn</Form.Label>
                                    <Form.Control as="textarea" rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Trạng thái</Form.Label>
                                    <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Tạm ẩn</option>
                                    </Form.Select>
                                </Form.Group>
                            </Card.Body>
                            <Card.Footer className="text-end">
                                <Button variant="secondary" type="button" className="me-2" onClick={() => navigate('/admin/categories')}>Hủy</Button>
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
                            <Card.Title as="h5"><FaInfoCircle className="me-2" />Thông tin thêm</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Alert variant="info">
                                <p><strong>Trạng thái "Hoạt động":</strong></p>
                                <p className="mb-0">Danh mục sẽ được hiển thị cho khách hàng và có thể thêm sản phẩm vào.</p>
                            </Alert>
                             <Alert variant="warning">
                                <p><strong>Trạng thái "Tạm ẩn":</strong></p>
                                <p className="mb-0">Danh mục sẽ bị ẩn khỏi trang web của khách hàng.</p>
                            </Alert>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default EditCategoryPage;