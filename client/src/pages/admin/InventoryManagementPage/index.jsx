import React from 'react';
import { Table, Button, Badge, Card } from 'react-bootstrap';
import { FaBoxes } from 'react-icons/fa';
import { mockProducts } from '../../../data/mockData';
const getStockStatus = (stock) => {
  if (stock === 0) return { variant: 'danger', label: 'Hết hàng' };
  if (stock <= 10) return { variant: 'warning', label: 'Sắp hết hàng' };
  return { variant: 'success', label: 'Còn hàng' };
};


const InventoryManagementPage = () => {
  return (
    <Card className="card-custom">
      <Card.Header>
        <Card.Title as="h4" className="mb-0">Quản lý hàng tồn kho</Card.Title>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive className="table-custom">
          <thead>
            <tr>
              <th>ID Sản phẩm</th>
              <th>Tên sản phẩm</th>
              <th className="text-center">Tồn kho</th>
              <th className="text-center">Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {mockProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td className="text-center">{product.stock}</td>
                <td className="text-center">
                  <Badge bg={status.variant}>{status.label}</Badge>
                </td>
                <td>
                  <Button variant="primary" size="sm">
                    <FaBoxes className="me-2" /> Nhập kho
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default InventoryManagementPage;