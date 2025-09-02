import React from 'react';
// ✨ IMPORT THÊM TABLE ✨
import { Card, Col, Row, ProgressBar, Image } from 'react-bootstrap';
import { FaUsers, FaShoppingCart, FaDollarSign, FaChartBar } from 'react-icons/fa';

// ✨ IMPORT THÊM BIỂU ĐỒ TRÒN (DOUGHNUT) ✨
import { Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  // ✨ ĐĂNG KÝ THÊM THÀNH PHẦN CHO BIỂU ĐỒ TRÒN ✨
  ArcElement 
} from 'chart.js';

// ✨ IMPORT DỮ LIỆU MỚI ✨
import { getSimpleDashboardData, getSalesByCategory } from '../../../data/dashboardData';

// ✨ ĐĂNG KÝ CÁC THÀNH PHẦN CẦN THIẾT CHO CHART.JS ✨
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Component StatCard giữ nguyên
const StatCard = ({ icon, title, value, color }) => (
  <Card className={`text-white bg-${color} mb-4 card-custom`}>
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <Card.Title as="h4">{value}</Card.Title>
          <Card.Text>{title}</Card.Text>
        </div>
        <div className="h1 opacity-75">{icon}</div>
      </div>
    </Card.Body>
  </Card>
);

const SimpleDashboard = () => {
  const simpleData = getSimpleDashboardData();
  const categoryData = getSalesByCategory();

  // Dữ liệu cho biểu đồ tròn
  const doughnutData = {
    labels: categoryData.labels,
    datasets: [
      {
        label: 'Doanh thu',
        data: categoryData.data,
        backgroundColor: [
          'rgba(13, 110, 253, 0.7)',
          'rgba(25, 135, 84, 0.7)',
          'rgba(255, 193, 7, 0.7)',
        ],
        borderColor: [
          'rgba(13, 110, 253, 1)',
          'rgba(25, 135, 84, 1)',
          'rgba(255, 193, 7, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Tỷ lệ Doanh thu theo Danh mục',
        font: { size: 16 }
      },
    },
  };

  const maxSold = Math.max(...simpleData.bestSellingProducts.map(p => p.sold));

  return (
    <Row>
      {/* 4 THẺ STAT CARD VẪN GIỮ NGUYÊN */}
      <Col md={6} xl={3}>
        <StatCard icon={<FaUsers/>} title="Tổng số người dùng" value={simpleData.totalUsers} color="primary" />
      </Col>
      <Col md={6} xl={3}>
        <StatCard icon={<FaShoppingCart/>} title="Tổng số đơn hàng" value={simpleData.totalOrders} color="success" />
      </Col>
      <Col md={6} xl={3}>
        <StatCard icon={<FaDollarSign/>} title="Tổng doanh thu" value={`${(simpleData.totalRevenue / 1000000).toFixed(1)}M`} color="warning" />
      </Col>
      <Col md={6} xl={3}>
        <StatCard icon={<FaChartBar/>} title="Người dùng mới (tháng)" value={simpleData.newUsersThisMonth} color="info" />
      </Col>

       <Row className="d-flex " >
            <Col lg={5} className="mb-4">
                <Card className="card-custom d-flex flex-column">
                <Card.Body>
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                </Card.Body>
                </Card>
            </Col>

            <Col lg={7}>
                <Card className="card-custom d-flex flex-column">
                <Card.Header>
                    <Card.Title as="h5">Top 5 sản phẩm bán chạy</Card.Title>
                </Card.Header>
                <div className="top-product-list">
                    {simpleData.bestSellingProducts.map((product, index) => (
                    <div key={index} className="top-product-item">
                        <Image src={product.image} className="top-product-img" />
                        <div className="top-product-info">
                        <strong>{product.name}</strong>
                        <small className="text-muted">{product.category}</small>
                        </div>
                        <div className="top-product-sales">
                        <strong>{product.revenue.toLocaleString('vi-VN')}đ</strong>
                        <ProgressBar 
                            now={(product.sold / maxSold) * 100} 
                            label={`${product.sold} sp`} 
                            variant="success" 
                        />
                        </div>
                    </div>
                    ))}
                </div>
                </Card>
            </Col>
      </Row>
    </Row>
  );
};

export default SimpleDashboard;