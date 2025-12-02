// src/pages/admin/OrderDetailPage/index.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Badge, Table, Button, Image, Modal, Form, Spinner } from 'react-bootstrap';
import { FaUser, FaMapMarkerAlt, FaCreditCard, FaPrint, FaTruck, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify'; // Giả sử bạn dùng react-toastify
import './OrderDetailPage.css';

// Map trạng thái từ Backend (Tiếng Anh) -> Frontend (Tiếng Việt) & Màu sắc
const STATUS_MAP = {
    pending: { label: 'Chờ xác nhận', color: 'secondary', next: ['confirmed', 'cancelled'] },
    confirmed: { label: 'Đã xác nhận', color: 'info', next: ['shipping', 'cancelled'] },
    shipping: { label: 'Đang giao hàng', color: 'warning', next: ['delivered', 'cancelled'] },
    delivered: { label: 'Hoàn thành', color: 'success', next: [] },
    cancelled: { label: 'Đã hủy', color: 'danger', next: [] }
};

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    
    // API URL & Config
    const API_URL = 'http://localhost:5000/api/v1/orders'; // Thay bằng port backend của bạn
    const getAuthConfig = () => {
        const token = localStorage.getItem('token'); // Lấy token từ localStorage
        return {
            headers: { Authorization: `Bearer ${token}` }
        };
    };

    // 1. Fetch dữ liệu đơn hàng
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`${API_URL}/${orderId}`, getAuthConfig());
                setOrder(res.data.data);
                setNewStatus(res.data.data.currentStatus);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Không thể tải thông tin đơn hàng');
                setLoading(false);
                toast.error('Lỗi tải đơn hàng!');
            }
        };
        fetchOrder();
    }, [orderId]);

    // 2. Xử lý cập nhật trạng thái
    const handleStatusUpdate = async () => {
        try {
            const res = await axios.put(`${API_URL}/${orderId}`, { status: newStatus }, getAuthConfig());
            setOrder(res.data.data); // Cập nhật lại state với dữ liệu mới từ server
            setShowStatusModal(false);
            toast.success('Cập nhật trạng thái thành công!');
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Lỗi khi cập nhật trạng thái');
        }
    };

    // 3. Xử lý xóa đơn hàng
    const handleDeleteOrder = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác!')) {
            try {
                await axios.delete(`${API_URL}/${orderId}`, getAuthConfig());
                toast.success('Đã xóa đơn hàng');
                navigate('/admin/orders'); // Quay về trang danh sách
            } catch (err) {
                toast.error(err.response?.data?.msg || 'Lỗi khi xóa đơn hàng');
            }
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;
    if (error || !order) return <div className="text-center p-5 text-danger">{error || 'Không tìm thấy đơn hàng'}</div>;

    const currentStatusInfo = STATUS_MAP[order.currentStatus] || { label: order.currentStatus, color: 'secondary' };

    return (
        <div className="p-4">
            {/* Header */}
            <Row className="mb-3 align-items-center">
                <Col>
                    <h3>Chi tiết đơn hàng #{order._id.slice(-6).toUpperCase()}</h3>
                    <p className="text-muted">
                        Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </Col>
                <Col className="text-end">
                    <Button variant="outline-danger" className="me-2" onClick={handleDeleteOrder}>
                        <FaTrash className="me-2" /> Xóa đơn
                    </Button>
                    <Button variant="outline-secondary">
                        <FaPrint className="me-2" /> In hóa đơn
                    </Button>
                </Col>
            </Row>

            <Row>
                {/* CỘT TRÁI: THÔNG TIN */}
                <Col lg={4}>
                    {/* Khách hàng */}
                    <Card className="card-custom mb-4 shadow-sm">
                        <Card.Header className="bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <Card.Title as="h6" className="mb-0 fw-bold"><FaUser className="me-2" />Khách hàng</Card.Title>
                                <Badge bg={currentStatusInfo.color}>{currentStatusInfo.label}</Badge>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <p><strong>{order.customerInfo.name}</strong></p>
                            <p className="text-muted mb-1">Email: {order.customerInfo.email}</p>
                            <p className="text-muted">SĐT: {order.customerInfo.phone}</p>
                        </Card.Body>
                    </Card>

                    {/* Giao hàng */}
                    <Card className="card-custom mb-4 shadow-sm">
                        <Card.Header className="bg-white">
                            <Card.Title as="h6" className="mb-0 fw-bold"><FaMapMarkerAlt className="me-2" />Người nhận & Địa chỉ</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <p><strong>{order.shippingInfo.receiverName}</strong> ({order.shippingInfo.receiverPhone})</p>
                            <p className="mb-0">{order.shippingInfo.fullAddress}</p>
                            {order.shippingInfo.note && <p className="text-info mt-2"><small>Ghi chú: {order.shippingInfo.note}</small></p>}
                        </Card.Body>
                    </Card>

                    {/* Thanh toán */}
                    <Card className="card-custom mb-4 shadow-sm">
                        <Card.Header className="bg-white">
                            <Card.Title as="h6" className="mb-0 fw-bold"><FaCreditCard className="me-2" />Thanh toán</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <p>Phương thức: <strong className="text-uppercase">{order.paymentMethod}</strong></p>
                            {/* Nếu có logic thanh toán online status thì hiển thị thêm ở đây */}
                        </Card.Body>
                    </Card>
                </Col>

                {/* CỘT PHẢI: SẢN PHẨM */}
                <Col lg={8}>
                    <Card className="card-custom shadow-sm">
                        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                            <Card.Title as="h6" className="mb-0 fw-bold">Danh sách sản phẩm</Card.Title>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive className="align-middle mb-0" hover>
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">Sản phẩm</th>
                                        <th className="text-center">Đơn giá</th>
                                        <th className="text-center">Số lượng</th>
                                        <th className="text-end pe-4">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center">
                                                    <Image 
                                                        src={item.variant?.image || 'https://via.placeholder.com/50'} 
                                                        className="product-thumbnail me-3 border" 
                                                    />
                                                    <div>
                                                        <div className="fw-bold text-dark">{item.variant?.name}</div>
                                                        <small className="text-muted">{item.variant?.variantName} | SKU: {item.variant?.sku}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center">{item.variant?.price?.toLocaleString('vi-VN')}đ</td>
                                            <td className="text-center">{item.quantity}</td>
                                            <td className="text-end pe-4">{(item.variant?.price * item.quantity).toLocaleString('vi-VN')}đ</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                        
                        {/* Tổng kết đơn hàng */}
                        <Card.Footer className="order-summary bg-light">
                            <Row>
                                <Col md={{ span: 5, offset: 7 }}>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Tạm tính:</span>
                                        <span>{order.summary.subtotal.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Phí vận chuyển:</span>
                                        <span>{order.summary.shippingFee.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    {(order.summary.voucherDiscount + order.summary.pointsDiscount) > 0 && (
                                        <div className="d-flex justify-content-between mb-2 text-success">
                                            <span>Giảm giá:</span>
                                            <span>- {(order.summary.voucherDiscount + order.summary.pointsDiscount).toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    )}
                                    <hr />
                                    <div className="d-flex justify-content-between fw-bold fs-5 text-primary">
                                        <span>Tổng cộng:</span>
                                        <span>{order.summary.finalTotal.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>

                    {/* Nút cập nhật trạng thái */}
                    <div className="mt-4 text-end">
                        <Button 
                            variant="primary" 
                            size="lg"
                            onClick={() => setShowStatusModal(true)}
                            disabled={order.currentStatus === 'cancelled' || order.currentStatus === 'delivered'}
                        >
                            <FaTruck className="me-2" />Cập nhật trạng thái
                        </Button>
                    </div>

                    {/* Modal Cập nhật trạng thái */}
                    <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Cập nhật trạng thái đơn hàng</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group controlId="statusSelect">
                                <Form.Label className="fw-bold">Chọn trạng thái mới:</Form.Label>
                                <Form.Select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    {/* Map qua các keys của STATUS_MAP để tạo option */}
                                    {Object.keys(STATUS_MAP).map(key => (
                                        <option 
                                            key={key} 
                                            value={key}
                                            // Logic disable: Không cho chọn trạng thái lùi (tùy chỉnh nếu muốn)
                                        >
                                            {STATUS_MAP[key].label}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Text className="text-muted">
                                    Lưu ý: Nếu chọn "Đã hủy", số lượng sản phẩm sẽ được hoàn lại kho.
                                </Form.Text>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
                                Đóng
                            </Button>
                            <Button variant="primary" onClick={handleStatusUpdate}>
                                Xác nhận cập nhật
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Col>
            </Row>
        </div>
    );
};

export default OrderDetailPage;