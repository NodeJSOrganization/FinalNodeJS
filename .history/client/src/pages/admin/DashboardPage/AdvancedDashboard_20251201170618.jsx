// src/components/dashboard/AdvancedDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Col, Row, ButtonGroup, Button, Form, Spinner } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { FaFilter } from 'react-icons/fa'; // Import thêm icon lọc
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdvancedDashboard = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(false);

  // 1. Thêm State lưu ngày
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // 2. Tạo URL có kèm query startDate và endDate
      let url = `http://localhost:5000/api/v1/dashboard/analysis?timeframe=${timeframe}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await axios.get(url, {
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
            label: 'Doanh thu',
            data: revenueData,
            borderColor: 'rgb(13, 110, 253)',
            backgroundColor: 'rgba(13, 110, 253, 0.5)',
            tension: 0.3
          },
          {
            label: 'Lợi nhuận (30%)',
            data: profitData,
            borderColor: 'rgb(25, 135, 84)',
            backgroundColor: 'rgba(25, 135, 84, 0.5)',
            tension: 0.3
          },
        ],
      });
      setLoading(false);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      setLoading(false);
    }
  };

  // Gọi API khi timeframe thay đổi hoặc khi người dùng bấm nút Lọc
  useEffect(() => {
    fetchData();
  }, [timeframe]); // Chỉ tự động chạy khi đổi timeframe

  const handleFilter = () => {
      fetchData(); // Bấm nút mới chạy lọc ngày
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Phân tích Doanh thu & Lợi nhuận` },
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
    <Card className="card-custom shadow-sm">
      <Card.Header className="bg-white py-3">
        <Row className="align-items-center g-3">
          <Col lg={5}>
            <ButtonGroup className="w-100 w-lg-auto">
              {/* Các nút Timeframe giữ nguyên */}
              <Button variant={timeframe === 'weekly' ? 'primary' : 'outline-primary'} onClick={() => setTimeframe('weekly')}>Tuần</Button>
              <Button variant={timeframe === 'monthly' ? 'primary' : 'outline-primary'} onClick={() => setTimeframe('monthly')}>Tháng</Button>
              <Button variant={timeframe === 'quarterly' ? 'primary' : 'outline-primary'} onClick={() => setTimeframe('quarterly')}>Quý</Button>
              <Button variant={timeframe === 'annually' ? 'primary' : 'outline-primary'} onClick={() => setTimeframe('annually')}>Năm</Button>
            </ButtonGroup>
          </Col>
          
          {/* 3. Giao diện chọn ngày và nút Lọc */}
          <Col lg={7}>
            <div className="d-flex justify-content-lg-end gap-2">
                <Form.Control 
                    type="date" 
                    style={{maxWidth: '160px'}}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    title="Từ ngày"
                />
                <span className="align-self-center text-muted">-</span>
                <Form.Control 
                    type="date" 
                    style={{maxWidth: '160px'}}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    title="Đến ngày"
                />
                <Button variant="primary" onClick={handleFilter} disabled={loading}>
                    <FaFilter className="me-1"/> Lọc
                </Button>
            </div>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <div style={{ height: '400px', position: 'relative' }}>
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