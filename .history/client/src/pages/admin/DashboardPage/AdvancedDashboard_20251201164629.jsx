// src/components/dashboard/AdvancedDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Col, Row, ButtonGroup, Button, Form, Spinner } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios'; // Import axios

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdvancedDashboard = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        // Gọi API với param timeframe
        const res = await axios.get(`http://localhost:5000/api/v1/dashboard/analysis?timeframe=${timeframe}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data.data;
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
              tension: 0.3
            },
            {
              label: 'Lợi nhuận (VND) - Ước tính 30%',
              data: profitData,
              borderColor: 'rgb(25, 135, 84)',
              backgroundColor: 'rgba(25, 135, 84, 0.5)',
              tension: 0.3
            },
          ],
        });
        setLoading(false);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu biểu đồ:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe]); // Chạy lại khi timeframe thay đổi

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Phân tích Doanh thu & Lợi nhuận (${timeframe})` },
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return (value / 1000000) + 'tr';
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
            {/* Phần Date picker này đang để UI cho đẹp, logic filter chi tiết có thể làm sau */}
            <Form.Control type="date" style={{width: '180px'}} className="me-2"/>
            <Form.Control type="date" style={{width: '180px'}}/>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <div style={{ height: '500px', position: 'relative' }}>
          {loading ? (
             <div className="d-flex justify-content-center align-items-center h-100">
                <Spinner animation="border" variant="primary" />
             </div>
          ) : (
             <Line options={chartOptions} data={chartData} />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default AdvancedDashboard;