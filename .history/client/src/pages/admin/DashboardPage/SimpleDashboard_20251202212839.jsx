// src/components/dashboard/SimpleDashboard.jsx (hoặc đường dẫn của bạn)
import React, { useState, useEffect } from 'react';
import { useWindowSize } from '../../../hooks/useWindowSize';
import { Card, Col, Row, ProgressBar, Image, Spinner } from 'react-bootstrap';
import { FaUsers, FaShoppingCart, FaDollarSign, FaChartBar } from 'react-icons/fa';
import axios from 'axios'; // Import axios

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

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
  // State lưu dữ liệu thật
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartKey, setChartKey] = useState(0);
  const { width } = useWindowSize();

  // Hàm lấy dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/v1/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải dashboard:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Force re-render chart khi resize
  useEffect(() => {
    const timer = setTimeout(() => setChartKey(prev => prev + 1), 100);
    return () => clearTimeout(timer);
  }, [width]);

  if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;
  if (!data) return <div className="text-center p-5">Không có dữ liệu</div>;

  // Cấu hình dữ liệu cho biểu đồ tròn
  const doughnutData = {
    labels: data.categorySales.labels,
    datasets: [
      {
        label: 'Doanh thu',
        data: data.categorySales.data,
        backgroundColor: ['rgba(13, 110, 253, 0.7)', 'rgba(25, 135, 84, 0.7)', 'rgba(255, 193, 7, 0.7)', 'rgba(220, 53, 69, 0.7)', 'rgba(13, 202, 240, 0.7)'],
        borderColor: ['#fff'],
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Tỷ lệ Doanh thu theo Danh mục', font: { size: 16 } },
    },
  };

  // Tìm số lượng bán max để tính % thanh progress bar
  const maxSold = data.bestSellingProducts.length > 0
    ? Math.max(...data.bestSellingProducts.map(p => p.sold))
    : 1;

  return (
    <Row>
      <Col md={6} xl={3}>
        <StatCard icon={<FaUsers />} title="Tổng số người dùng" value={data.totalUsers} color="primary" />
      </Col>
      <Col md={6} xl={3}>
        <StatCard icon={<FaShoppingCart />} title="Tổng số đơn hàng" value={data.totalOrders} color="success" />
      </Col>
      <Col md={6} xl={3}>
        <StatCard
          icon={<FaDollarSign />}
          title="Tổng doanh thu"
          value={`${(data.totalRevenue / 1000000).toFixed(1)}M`}
          color="warning"
        />
      </Col>
      <Col md={6} xl={3}>
        <StatCard icon={<FaChartBar />} title="Người dùng mới (tháng)" value={data.newUsersThisMonth} color="info" />
      </Col>

      <Row className="d-flex">
        <Col xs={12} lg={5} className="mb-4">
          <Card className="card-custom h-100">
            <Card.Body>
              <div className="chart-container">
                <Doughnut key={chartKey} data={doughnutData} options={doughnutOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="card-custom d-flex flex-column h-100">
            <Card.Header>
              <Card.Title as="h5">Top 5 sản phẩm bán chạy</Card.Title>
            </Card.Header>
            <div className="top-product-list">
              {simpleData.bestSellingProducts.map((product, index) => {

                // ✨ LOGIC MỚI: Kiểm tra xem ảnh là String (URL) hay Object để lấy đường dẫn đúng
                const imageUrl = typeof product.image === 'string'
                  ? product.image
                  : product.image?.url;

                return (
                  <div key={index} className="top-product-item">
                    {/* Sử dụng biến imageUrl đã xử lý ở trên */}
                    <Image
                      src={imageUrl || 'https://via.placeholder.com/50'}
                      className="top-product-img"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                    />

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
                );
              })}
              {simpleData.bestSellingProducts.length === 0 && <p className="text-center mt-3 text-muted">Chưa có dữ liệu bán hàng</p>}
            </div>
          </Card>
        </Col>
      </Row>
    </Row>
  );
};

export default SimpleDashboard;