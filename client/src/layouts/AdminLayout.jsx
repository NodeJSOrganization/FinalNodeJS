// ✨ SỬA DÒNG NÀY: Thêm useState vào import
import React, { useState } from 'react'; 
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import './AdminLayout.css';
import '../styles/AdminGlobal.css';

const AdminLayout = () => {
  // Bây giờ dòng này sẽ hoạt động vì useState đã được import
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Truyền state và hàm thay đổi state xuống Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <main className="admin-content">
        <div className="container-fluid p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;