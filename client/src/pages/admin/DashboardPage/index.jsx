import React from 'react';
// ✨ 1. IMPORT THÊM ROW VÀ COL ✨
import { Tabs, Tab, Row, Col } from 'react-bootstrap'; 
import SimpleDashboard from './SimpleDashboard';
import AdvancedDashboard from './AdvancedDashboard';
import './Dashboard.css';

const DashboardPage = () => {
  return (
    // ✨ 2. BỌC TOÀN BỘ NỘI DUNG TRONG MỘT ROW VÀ COL ✨
    <Row>
      <Col xs={12}>
        <h2 className="mb-4">Dashboard</h2>
        
        <Tabs defaultActiveKey="simple" id="dashboard-tabs" className="mb-3">
          <Tab eventKey="simple" title="Tổng quan (Simple)">
            {/* Nội dung của tab này sẽ tự động chiếm 100% chiều rộng của Col cha */}
            <SimpleDashboard />
          </Tab>
          <Tab eventKey="advanced" title="Phân tích (Advanced)">
            {/* Nội dung của tab này CŨNG sẽ chiếm 100% chiều rộng */}
            <AdvancedDashboard />
          </Tab>
        </Tabs>
      </Col>
    </Row>
  );
};

export default DashboardPage;