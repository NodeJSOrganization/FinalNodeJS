import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert, Spinner, Image } from 'react-bootstrap';
import { FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddUserPage = () => {
    const navigate = useNavigate();

    // Form states
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phoneNumber: '', gender: '', role: 'customer' });
    const [address, setAddress] = useState({ province: '', district: '', ward: '', streetAddress: '' });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

    // Address API states
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // UI states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        axios.get('https://provinces.open-api.vn/api/p/').then(res => setProvinces(res.data));
    }, []);

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleAddressChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

    const handleProvinceChange = async (e) => {
        const provinceCode = e.target.options[e.target.selectedIndex].dataset.code;
        setAddress({ province: e.target.value, district: '', ward: '', streetAddress: address.streetAddress });
        if (provinceCode) {
            const res = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            setDistricts(res.data.districts);
            setWards([]);
        }
    };

    const handleDistrictChange = async (e) => {
        const districtCode = e.target.options[e.target.selectedIndex].dataset.code;
        setAddress({ ...address, district: e.target.value, ward: '' });
        if (districtCode) {
            const res = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            setWards(res.data.wards);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        const finalFormData = new FormData();
        Object.keys(formData).forEach(key => finalFormData.append(key, formData[key]));
        finalFormData.append('address', JSON.stringify(address));
        if (avatar) {
            finalFormData.append('avatar', avatar);
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/v1/users', finalFormData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setSuccess('Thêm người dùng thành công! Đang chuyển hướng...');
            setTimeout(() => navigate('/admin/users'), 2000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Thêm người dùng thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4">
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={8}>
                        <Card className="card-custom">
                            <Card.Header><Card.Title as="h4"><FaUserPlus className="me-2" />Tạo Người dùng mới</Card.Title></Card.Header>
                            <Card.Body>
                                {error && <Alert variant="danger">{error}</Alert>}
                                {success && <Alert variant="success">{success}</Alert>}
                                <Row>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Họ và Tên</Form.Label><Form.Control type="text" name="fullName" onChange={handleFormChange} required /></Form.Group></Col>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" onChange={handleFormChange} required /></Form.Group></Col>
                                </Row>
                                <Form.Group className="mb-3"><Form.Label>Mật khẩu</Form.Label><Form.Control type="password" name="password" onChange={handleFormChange} required /></Form.Group>
                                <hr />
                                <Row>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Số điện thoại</Form.Label><Form.Control type="tel" name="phoneNumber" onChange={handleFormChange} /></Form.Group></Col>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Giới tính</Form.Label><Form.Select name="gender" onChange={handleFormChange}><option value="">-- Chọn --</option><option value="Nam">Nam</option><option value="Nữ">Nữ</option><option value="Khác">Khác</option></Form.Select></Form.Group></Col>
                                </Row>
                                <Row>
                                    <Col md={4}><Form.Group className="mb-3"><Form.Label>Tỉnh/Thành phố</Form.Label><Form.Select onChange={handleProvinceChange}><option value="">-- Chọn --</option>{provinces.map(p => <option key={p.code} data-code={p.code} value={p.name}>{p.name}</option>)}</Form.Select></Form.Group></Col>
                                    <Col md={4}><Form.Group className="mb-3"><Form.Label>Quận/Huyện</Form.Label><Form.Select name="district" onChange={handleDistrictChange} disabled={!districts.length}><option value="">-- Chọn --</option>{districts.map(d => <option key={d.code} data-code={d.code} value={d.name}>{d.name}</option>)}</Form.Select></Form.Group></Col>
                                    <Col md={4}><Form.Group className="mb-3"><Form.Label>Phường/Xã</Form.Label><Form.Select name="ward" onChange={handleAddressChange} disabled={!wards.length}><option value="">-- Chọn --</option>{wards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}</Form.Select></Form.Group></Col>
                                </Row>
                                <Form.Group className="mb-3"><Form.Label>Địa chỉ chi tiết</Form.Label><Form.Control type="text" name="streetAddress" onChange={handleAddressChange} placeholder="Số nhà, tên đường..." /></Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="card-custom mb-3">
                            <Card.Header><Card.Title as="h5">Ảnh đại diện</Card.Title></Card.Header>
                            <Card.Body className="text-center">
                                <Image src={avatarPreview || 'https://via.placeholder.com/150'} roundedCircle width={150} height={150} className="mb-3" />
                                <Form.Control type="file" accept="image/*" onChange={handleAvatarChange} />
                            </Card.Body>
                        </Card>
                        <Card className="card-custom">
                            <Card.Header><Card.Title as="h5">Phân quyền</Card.Title></Card.Header>
                            <Card.Body>
                                <Form.Select name="role" onChange={handleFormChange}><option value="customer">Customer</option><option value="admin">Admin</option></Form.Select>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <div className="text-end mt-3">
                    <Button variant="secondary" type="button" className="me-2" onClick={() => navigate('/admin/users')}>Hủy</Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>{isSubmitting ? <Spinner size="sm" /> : 'Lưu người dùng'}</Button>
                </div>
            </Form>
        </div>
    );
};

export default AddUserPage;