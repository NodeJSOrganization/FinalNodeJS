import React, { useState, useEffect } from 'react';
import { Card, Col, Row, ButtonGroup, Button, Form } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { getAdvancedDashboardData } from '../../../data/dashboardData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdvancedDashboard = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const data = getAdvancedDashboardData();
    const labels = data.map(d => d.date);
    const revenueData = data.map(d => d.revenue);
    const profitData = data.map(d => d.profit);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Doanh thu (VND)',
          data: revenueData,
          borderColor: 'rgb(13, 110, 253)',
          backgroundColor: 'rgba(13, 110, 253, 0.5)',
          tension: 0.3 // Làm cho đường cong mượt hơn
        },
        {
          label: 'Lợi nhuận (VND)',
          data: profitData,
          borderColor: 'rgb(25, 135, 84)',
          backgroundColor: 'rgba(25, 135, 84, 0.5)',
          tension: 0.3 // Làm cho đường cong mượt hơn
        },
      ],
    });
  }, [timeframe]);

  // ✨ SỬA Ở ĐÂY: Thêm maintainAspectRatio: false ✨
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Quan trọng nhất! Cho phép biểu đồ thay đổi tỷ lệ
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Phân tích Doanh thu & Lợi nhuận (${timeframe})` },
    },
    scales: { // Tùy chỉnh các trục cho đẹp hơn
      y: {
        ticks: {
          callback: function(value) {
            return (value / 1000000) + 'tr'; // Hiển thị dạng "80tr" cho gọn
          }
        }
      }
    }
  };

  return (
    <Card className="card-custom">
      <Card.Header>
        <Row className="align-items-center">
          <Col md={6}>
            <ButtonGroup>
              <Button variant={timeframe === 'weekly' ? 'primary' : 'outline-primary'} onClick={() => setTimeframe('weekly')}>Tuần</Button>
              <Button variant={timeframe === 'monthly' ? 'primary' : 'outline-primary'} onClick={() => setTimeframe('monthly')}>Tháng</Button>
              <Button variant={timeframe === 'quarterly' ? 'primary' : 'outline-primary'} onClick={() => setTimeframe('quarterly')}>Quý</Button>
              <Button variant={timeframe === 'annually' ? 'primary' : 'outline-primary'} onClick={() => setTimeframe('annually')}>Năm</Button>
            </ButtonGroup>
          </Col>
          <Col md={6} className="d-flex justify-content-end mt-2 mt-md-0">
            <Form.Control type="date" style={{width: '180px'}} className="me-2"/>
            <Form.Control type="date" style={{width: '180px'}}/>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        {/* ✨ SỬA Ở ĐÂY: Bọc biểu đồ trong một div có chiều cao cố định ✨ */}
        <div style={{ height: '500px' }}> {/* Bạn có thể thay đổi số 500px thành giá trị mong muốn */}
          <Line options={chartOptions} data={chartData} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default AdvancedDashboard;