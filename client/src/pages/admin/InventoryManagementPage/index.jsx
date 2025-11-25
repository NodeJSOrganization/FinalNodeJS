// src/pages/admin/InventoryManagementPage/index.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Badge, Card, Row, Col, Form, Pagination, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { FaSearch, FaSave } from 'react-icons/fa';
import axios from 'axios';
import './InventoryManagement.css'; // Import file CSS

const InventoryManagementPage = () => {
    // State chính
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho việc chỉnh sửa inline
    const [editingQuantities, setEditingQuantities] = useState({}); // { variantId: newQuantity }
    const [updateStatus, setUpdateStatus] = useState({}); // { variantId: 'loading' | 'success' | 'error' }

    // State cho bộ lọc và phân trang
    const [filters, setFilters] = useState({ searchTerm: '', status: 'all' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Fetch dữ liệu tồn kho từ API
    useEffect(() => {
        const fetchInventory = async () => {
            try {
                setLoading(true);
                setError(null);
                const { data } = await axios.get('/api/v1/inventory', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setInventory(data.data);
            } catch (err) {
                setError('Không thể tải dữ liệu tồn kho.');
            } finally {
                setLoading(false);
            }
        };
        fetchInventory();
    }, []);

    // Hàm hiển thị huy hiệu trạng thái kho
    const getStockStatus = (quantity) => {
        if (quantity > 10) return <Badge bg="success" className="stock-status-badge">Còn hàng</Badge>;
        if (quantity > 0) return <Badge bg="warning" className="stock-status-badge">Sắp hết</Badge>;
        return <Badge bg="danger" className="stock-status-badge">Hết hàng</Badge>;
    };

    // Xử lý thay đổi số lượng trong input
    const handleQuantityChange = (variantId, value) => {
        setEditingQuantities(prev => ({ ...prev, [variantId]: value }));
    };

    // Xử lý cập nhật số lượng
    const handleUpdateQuantity = async (productId, variantId) => {
        const newQuantity = editingQuantities[variantId];
        if (newQuantity === undefined || newQuantity < 0) return;

        setUpdateStatus(prev => ({ ...prev, [variantId]: 'loading' }));

        try {
            await axios.put(`/api/v1/inventory/${productId}/${variantId}`,
                { quantity: Number(newQuantity) },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            // Cập nhật state local để UI phản hồi ngay lập tức
            setInventory(prev => prev.map(item =>
                item.variant._id === variantId
                    ? { ...item, variant: { ...item.variant, quantity: Number(newQuantity) } }
                    : item
            ));

            setUpdateStatus(prev => ({ ...prev, [variantId]: 'success' }));
            // Xóa khỏi trạng thái đang chỉnh sửa
            setEditingQuantities(prev => {
                const newState = { ...prev };
                delete newState[variantId];
                return newState;
            });
            setTimeout(() => setUpdateStatus(prev => ({ ...prev, [variantId]: null })), 2000); // Xóa trạng thái thành công sau 2s

        } catch (err) {
            setUpdateStatus(prev => ({ ...prev, [variantId]: 'error' }));
        }
    };

    // Logic lọc và phân trang (Client-side)
    const filteredInventory = useMemo(() => {
        return inventory.filter(item => {
            const term = filters.searchTerm.toLowerCase();
            const matchesSearch = item.productName.toLowerCase().includes(term) ||
                item.variant.sku?.toLowerCase().includes(term) ||
                item.variant.color.toLowerCase().includes(term);

            const quantity = item.variant.quantity;
            let matchesStatus = true;
            if (filters.status === 'in_stock') matchesStatus = quantity > 10;
            else if (filters.status === 'low_stock') matchesStatus = quantity > 0 && quantity <= 10;
            else if (filters.status === 'out_of_stock') matchesStatus = quantity === 0;

            return matchesSearch && matchesStatus;
        });
    }, [inventory, filters]);

    const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
    const currentItems = filteredInventory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="p-4">
            <Card className="card-custom">
                <Card.Header><Card.Title as="h4">Quản lý Tồn kho</Card.Title></Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Row className="mb-3 align-items-center">
                        <Col md={5}>
                            <InputGroup>
                                <InputGroup.Text><FaSearch /></InputGroup.Text>
                                <Form.Control
                                    placeholder="Tìm theo tên SP, SKU, màu sắc..."
                                    value={filters.searchTerm}
                                    onChange={e => { setFilters({ ...filters, searchTerm: e.target.value }); setCurrentPage(1); }}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <Form.Select value={filters.status} onChange={e => { setFilters({ ...filters, status: e.target.value }); setCurrentPage(1); }}>
                                <option value="all">Tất cả trạng thái</option>
                                <option value="in_stock">Còn hàng</option>
                                <option value="low_stock">Sắp hết</option>
                                <option value="out_of_stock">Hết hàng</option>
                            </Form.Select>
                        </Col>
                        <Col md={4} className="d-flex justify-content-end">
                            <Form.Label className="me-2 mb-0">Hiển thị</Form.Label>
                            <Form.Select style={{ width: '80px' }} value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))}>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </Form.Select>
                        </Col>
                    </Row>

                    {loading ? <div className="text-center p-5"><Spinner /></div> : (
                        <>
                            <Table striped bordered hover responsive className="align-middle inventory-table">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>Phân loại</th>
                                        <th>SKU</th>
                                        <th className="text-center">Tồn kho</th>
                                        <th className="text-center">Trạng thái</th>
                                        <th style={{ width: '200px' }}>Cập nhật số lượng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? currentItems.map(item => {
                                        const variantId = item.variant._id;
                                        const isEditing = editingQuantities[variantId] !== undefined;
                                        const status = updateStatus[variantId];
                                        return (
                                            <tr key={variantId}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <img src={item.variant.image || 'https://via.placeholder.com/150'} alt={item.productName} className="inventory-thumbnail me-3" />
                                                        <div>
                                                            <strong>{item.productName}</strong><br />
                                                            <small className="text-muted">{item.brandName}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{item.variant.color} - {item.variant.performance}</td>
                                                <td>{item.variant.sku || 'N/A'}</td>
                                                <td className="text-center"><strong>{item.variant.quantity}</strong></td>
                                                <td className="text-center">{getStockStatus(item.variant.quantity)}</td>
                                                <td>
                                                    <InputGroup>
                                                        <Form.Control
                                                            type="number"
                                                            value={isEditing ? editingQuantities[variantId] : item.variant.quantity}
                                                            onChange={e => handleQuantityChange(variantId, e.target.value)}
                                                            min="0"
                                                        />
                                                        <Button
                                                            variant={status === 'success' ? 'success' : 'primary'}
                                                            onClick={() => handleUpdateQuantity(item.productId, variantId)}
                                                            disabled={!isEditing || status === 'loading'}
                                                        >
                                                            {status === 'loading' && <Spinner as="span" size="sm" />}
                                                            {status !== 'loading' && <FaSave />}
                                                        </Button>
                                                    </InputGroup>
                                                    {status === 'error' && <small className="text-danger">Lỗi!</small>}
                                                </td>
                                            </tr>
                                        )
                                    }) : (
                                        <tr><td colSpan="6" className="text-center">Không có dữ liệu tồn kho.</td></tr>
                                    )}
                                </tbody>
                            </Table>

                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center">
                                    <Pagination>
                                        <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
                                        {[...Array(totalPages).keys()].map(num => (
                                            <Pagination.Item key={num + 1} active={num + 1 === currentPage} onClick={() => setCurrentPage(num + 1)}>
                                                {num + 1}
                                            </Pagination.Item>
                                        ))}
                                        <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default InventoryManagementPage;