// src/pages/admin/AddUserPage/index.jsx
import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { FaUserPlus, FaInfoCircle, FaImage, FaVenusMars, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const AddUserPage = () => {
    // State cho các trường của form
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [gender, setGender] = useState('');
    const [role, setRole] = useState('Customer');
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const userData = {
            fullName,
            email,
            password,
            phone,
            address,
            gender,
            role,
            avatar,
            createdAt: new Date().toISOString()
        };
        console.log("Dữ liệu người dùng mới:", userData);
        alert('Người dùng đã được tạo! (Kiểm tra console log)');
    };

    return (
        <div className="p-4">
            <Row>
                <Col md={8}>
                    <Form onSubmit={handleSubmit}>
                        <Card className="card-custom">
                            <Card.Header>
                                <Card.Title as="h4"><FaUserPlus className="me-2" />Tạo Người dùng mới</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="fullName">
                                            <Form.Label>Họ và Tên</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="VD: Nguyễn Văn A"
                                                required
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="email">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder="VD: email@example.com"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3" controlId="password">
                                    <Form.Label>Mật khẩu</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Nhập mật khẩu ban đầu"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <Form.Text className="text-muted">
                                        Người dùng có thể đổi mật khẩu này sau khi đăng nhập lần đầu.
                                    </Form.Text>
                                </Form.Group>

                                <hr />

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="phone">
                                            <Form.Label><FaPhone className="me-2" />Số điện thoại</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                placeholder="VD: 0901234567"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="gender">
                                            <Form.Label><FaVenusMars className="me-2" />Giới tính</Form.Label>
                                            <Form.Select
                                                value={gender}
                                                onChange={(e) => setGender(e.target.value)}
                                            >
                                                <option value="">-- Chọn giới tính --</option>
                                                <option value="Nam">Nam</option>
                                                <option value="Nữ">Nữ</option>
                                                <option value="Khác">Khác</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3" controlId="address">
                                    <Form.Label><FaMapMarkerAlt className="me-2" />Địa chỉ</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </Form.Group>

                            </Card.Body>
                        </Card>
                    </Form>
                </Col>

                <Col md={4}>
                    

                    {/* Card Phân quyền */}
                    <Card className="card-custom">
                        <Card.Header>
                            <Card.Title as="h5"><FaInfoCircle className="me-2" />Phân quyền</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group controlId="userRole">
                                <Form.Label>Vai trò của người dùng</Form.Label>
                                <Form.Select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="Customer">Khách hàng (Customer)</option>
                                    <option value="Admin">Quản trị viên (Admin)</option>
                                </Form.Select>
                            </Form.Group>
                            <Alert variant="warning" className="mt-3">
                                Lưu ý: Phân quyền <strong>Admin</strong> sẽ cấp cho người dùng toàn bộ quyền truy cập vào trang quản trị này.
                            </Alert>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* NÚT SUBMIT */}
            <Row className="mt-3">
                <Col className="text-end">
                    <Button variant="secondary" type="button" className="me-2">Hủy</Button>
                    <Button variant="primary" type="submit">Lưu người dùng</Button>
                </Col>
            </Row>
        </div>
    );
};

export default AddUserPage;