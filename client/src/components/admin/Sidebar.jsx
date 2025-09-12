// --- START OF FILE src/components/Sidebar/Sidebar.jsx ---

import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FaAngleLeft, FaAngleRight, FaSignOutAlt } from 'react-icons/fa';
import { sidebarNavItems } from "./sidebarNavItems.jsx";
import "./Sidebar.css";
import { useSelector, useDispatch } from 'react-redux'; // Import hooks của Redux
import { logout } from '../../../features/auth/authSlice.js'; // Import action logout

// Component MenuItem giữ nguyên như cũ, không cần thay đổi
const MenuItem = ({ item, openKeys, handleMenuClick }) => {
  const isActive = openKeys.includes(item.key);
  if (item.children) {
    return (
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


// Component Sidebar chính
const Sidebar = ({ isCollapsed, setCollapsed }) => {
  const [openKeys, setOpenKeys] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Lấy thông tin user từ Redux store
  const { user } = useSelector((state) => state.auth);

  const handleToggleCollapse = () => {
    setCollapsed(!isCollapsed);
    setOpenKeys([]);
  };

  const handleMenuClick = (key) => {
    setOpenKeys(prevKeys =>
      prevKeys.includes(key)
        ? prevKeys.filter(k => k !== key)
        : [...prevKeys, key]
    );
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    dispatch(logout()); // Gửi action logout đến Redux
    navigate('/login'); // Chuyển hướng về trang đăng nhập
  };

  // Chuẩn bị dữ liệu để hiển thị
  const adminName = user ? user.fullName : 'Admin';
  // DÒNG ĐÃ SỬA: Thay thế 'userAvatar' bằng một URL ảnh mặc định
  const adminAvatar = user && user.avatar ? user.avatar.url : 'https://via.placeholder.com/150';
  const adminRole = user ? user.role : 'Administrator';

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
          <img src={adminAvatar} alt="User Avatar" />
          <div className="user-info">
            <h4>{adminName}</h4>
            <p style={{ textTransform: 'capitalize' }}>{adminRole}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;