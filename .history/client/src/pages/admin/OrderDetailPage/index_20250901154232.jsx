// src/pages/admin/OrderDetailPage/index.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Badge, Table, Button, Image, Modal, Form } from 'react-bootstrap';
import { FaUser, FaMapMarkerAlt, FaCreditCard, FaPrint, FaTruck } from 'react-icons/fa';
import { mockOrderDetail } from '../../../data/mockData';
import './OrderDetailPage.css';

const getStatusBadge = (status) => {
    switch (status) {
        case 'Hoàn thành': return 'success';
        case 'Đang xử lý': return 'warning';
        case 'Đã hủy': return 'danger';
        default: return 'secondary';
    }
};



const OrderDetailPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(mockOrderDetail);
    const [showModal, setShowModal] = useState(false);
    const [newStatus, setNewStatus] = useState(order.status); 
    
    const handleShowModal = () => {
        setNewStatus(order.status);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleStatusUpdate = () => {
        console.log(`Cập nhật trạng thái cho đơn hàng ${order.id} thành: ${newStatus}`);
        setOrder(prevOrder => ({ ...prevOrder, status: newStatus }));
        handleCloseModal();
    };

    return (
        <div className="p-4">
            <Row className="mb-3">
                <Col>
                    <h3>Chi tiết đơn hàng #{order.id}</h3>
                    <p className="text-muted">Ngày đặt: {order.orderDate}</p>
                </Col>
                <Col className="text-end">
                    <Button variant="outline-secondary" className="me-2"><FaPrint className="me-2" /> In đơn hàng</Button>
                </Col>
            </Row>

            <Row>
                {/* CỘT TRÁI: THÔNG TIN KHÁCH HÀNG & GIAO HÀNG */}
                <Col lg={4}>
                    <Card className="card-custom mb-4">
                        <Card.Header>
                            <Card.Title as="h5"><FaUser className="me-2" />Khách hàng</Card.Title>
                            <Badge bg={getStatusBadge(order.status)} pill>{order.status}</Badge>
                        </Card.Header>
                        <Card.Body>
                            <p><strong>{order.customer.name}</strong></p>
                            <p className="text-muted mb-1">{order.customer.email}</p>
                            <p className="text-muted">{order.customer.phone}</p>
                        </Card.Body>
                    </Card>
                    <Card className="card-custom mb-4">
                        <Card.Header>
                            <Card.Title as="h5"><FaMapMarkerAlt className="me-2" />Thông tin giao hàng</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <p><strong>{order.customer.name}</strong></p>
                            <p>{order.customer.shippingAddress}</p>
                        </Card.Body>
                    </Card>
                    <Card className="card-custom mb-4">
                        <Card.Header>
                            <Card.Title as="h5"><FaCreditCard className="me-2" />Thanh toán</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>Phương thức: <strong>{order.paymentMethod}</strong></p>
                        </Card.Body>
                    </Card>
                </Col>

                {/* CỘT PHẢI: CHI TIẾT SẢN PHẨM & THANH TOÁN */}
                <Col lg={8}>
                    <Card className="card-custom">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <Card.Title as="h5" className="mb-0">Các sản phẩm trong đơn</Card.Title>
                            <Badge bg={getStatusBadge(order.status)} pill>{order.status}</Badge>
                        </Card.Header>
                        <Card.Body>
                            <Table responsive className="align-middle">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th className="text-center">Số lượng</th>
                                        <th className="text-end">Giá</th>
                                        <th className="text-end">Tổng cộng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.products.map(product => (
                                        <tr key={product.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <Image src={product.image} className="product-thumbnail me-3" />
                                                    <span>{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="text-center">{product.quantity}</td>
                                            <td className="text-end">{product.price.toLocaleString('vi-VN')}đ</td>
                                            <td className="text-end">{(product.price * product.quantity).toLocaleString('vi-VN')}đ</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                        <Card.Footer className="order-summary">
                            <Row>
                                <Col md={{ span: 4, offset: 8 }}>
                                    <div className="d-flex justify-content-between">
                                        <span>Tạm tính:</span>
                                        <span>{order.summary.subtotal.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>Phí vận chuyển:</span>
                                        <span>{order.summary.shippingFee.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>Giảm giá:</span>
                                        <span>- {order.summary.discount.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between fw-bold h5">
                                        <span>Tổng cộng:</span>
                                        <span>{order.summary.total.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>

                    <div className="mt-3 text-end">
                        <Button variant="primary" onClick={handleShowModal}>
                            <FaTruck className="me-2" />Cập nhật trạng thái
                        </Button>
                    </div>
                    <Modal show={showModal} onHide={handleCloseModal} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Cập nhật trạng thái đơn hàng #{order.id}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group controlId="statusSelect">
                                <Form.Label>Chọn trạng thái mới</Form.Label>
                                <Form.Select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    <option value="Đang xử lý">Đang xử lý</option>
                                    <option value="Đang giao hàng">Đang giao hàng</option>
                                    <option value="Hoàn thành">Hoàn thành</option>
                                    <option value="Đã hủy">Đã hủy</option>
                                </Form.Select>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Hủy
                            </Button>
                            <Button variant="primary" onClick={handleStatusUpdate}>
                                Lưu thay đổi
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Col>
            </Row>
        </div>
    );
};

export default OrderDetailPage;