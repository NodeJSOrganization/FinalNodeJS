// src/layouts/AdminLayout.jsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import { useWindowSize } from "../../hooks/useWindowSize"; // Import hook
import "./AdminLayout.css";
import "../../styles/AdminGlobal.css";

const AdminLayout = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { width } = useWindowSize(); // Lấy chiều rộng cửa sổ từ hook

  // ✨ LOGIC TỰ ĐỘNG THU GỌN SIDEBAR ✨
  useEffect(() => {
    // 992px là điểm breakpoint "lg" của Bootstrap
    if (width < 992) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [width]); // Chạy lại effect này mỗi khi chiều rộng cửa sổ thay đổi

  return (
    <div
      className={`admin-layout ${
        isSidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
