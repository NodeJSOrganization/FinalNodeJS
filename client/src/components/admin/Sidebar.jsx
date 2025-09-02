import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FaAngleLeft, FaAngleRight, FaSignOutAlt } from 'react-icons/fa';
import { sidebarNavItems } from "./sidebarNavItems.jsx";
import "./Sidebar.css";
import userAvatar from "../../assets/images/spidermen.jpg";

// ✨ PHẦN 1: TẠO COMPONENT CON CÓ KHẢ NĂNG "TỰ GỌI LẠI CHÍNH NÓ" (ĐỆ QUY) ✨
const MenuItem = ({ item, openKeys, handleMenuClick }) => {
  // Kiểm tra xem menu này có đang mở hay không
  const isActive = openKeys.includes(item.key);

  // NẾU item này có con (children)
  if (item.children) {
    return (
      // Thêm class 'open' nếu menu đang mở
      <li className={isActive ? 'open' : ''}>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); handleMenuClick(item.key); }}
        >
          {item.icon}
          <span>{item.title}</span>
          <FaAngleRight className="dropdown-icon" />
        </a>
        <ul className="list-unstyled sidebar-submenu">
          <div>
            {item.children.map((child) => (
              // ✨ ĐÂY LÀ ĐỆ QUY: MenuItem lại render ra chính nó cho mỗi mục con ✨
              <MenuItem
                key={child.key}
                item={child}
                openKeys={openKeys}
                handleMenuClick={handleMenuClick}
              />
            ))}
          </div>
        </ul>
      </li>
    );
  }
  // NẾU item này KHÔNG có con
  else {
    return (
      <li>
        <NavLink to={item.path}>
          {item.icon}
          <span>{item.title}</span>
        </NavLink>
      </li>
    );
  }
};

// ✨ COMPONENT SIDEBAR CHÍNH BÂY GIỜ GỌN GÀNG HƠN RẤT NHIỀU ✨
const Sidebar = ({ isCollapsed, setCollapsed }) => {
  // ✨ PHẦN 2: THAY ĐỔI CÁCH LƯU TRẠNG THÁI ✨
  // Thay vì chỉ lưu 1 menu đang mở (string/null), ta lưu một MẢNG các menu đang mở
  const [openKeys, setOpenKeys] = useState([]);

  const handleToggleCollapse = () => {
    setCollapsed(!isCollapsed);
    setOpenKeys([]); // Đóng tất cả menu khi thu gọn
  };

  // ✨ PHẦN 3: CẬP NHẬT LOGIC XỬ LÝ CLICK ✨
  // Logic mới để thêm/bớt key khỏi mảng state
  const handleMenuClick = (key) => {
    setOpenKeys(prevKeys =>
      prevKeys.includes(key)
        ? prevKeys.filter(k => k !== key) // Nếu key đã có trong mảng -> xóa đi (đóng menu)
        : [...prevKeys, key]              // Nếu key chưa có -> thêm vào (mở menu)
    );
  };

  return (
    <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <Link to="/admin/dashboard" className="sidebar-logo">
          {isCollapsed ? <span>A</span> : <span>Admin Panel</span>}
        </Link>
        <button className="collapse-btn" onClick={handleToggleCollapse}>
          {isCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
        </button>
      </div>

      <ul className="list-unstyled components">
        {/* ✨ PHẦN 4: SỬ DỤNG COMPONENT ĐỆ QUY ✨ */}
        {/* Thay vì logic phức tạp, giờ ta chỉ cần gọi MenuItem cho mỗi mục cấp 1 */}
        {sidebarNavItems.map((item) => (
          <MenuItem
            key={item.key}
            item={item}
            openKeys={openKeys}
            handleMenuClick={handleMenuClick}
          />
        ))}
      </ul>

      <div className="sidebar-footer">
        <div className="user-profile">
          <img src={userAvatar} alt="User Avatar" />
          <div className="user-info">
            <h4>An</h4>
            <p>Administrator</p>
          </div>
        </div>
        <button className="logout-btn">
          <FaSignOutAlt />
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;