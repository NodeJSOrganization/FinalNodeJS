// src/components/account/AccountSidebar.jsx
import { Card, ListGroup } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const items = [
  { to: "profile", label: "Hồ sơ", icon: "bi bi-person-fill" },
  { to: "orders", label: "Đơn hàng", icon: "bi bi-box-seam-fill" },
  { to: "vouchers", label: "Vouchers", icon: "bi bi-star-fill" },
  { to: "addresses", label: "Địa chỉ", icon: "bi bi-building-fill" },
  {
    to: "change-password",
    label: "Đổi mật khẩu",
    icon: "bi bi-shield-lock-fill",
  },
];

export default function AccountSidebar({ sticky = false, onLogout }) {
  const handleLogout = (e) => {
    e.preventDefault();
    if (typeof onLogout === "function") return onLogout();
    // fallback nếu bạn chưa truyền onLogout từ trên
    window.location.href = "/logout";
  };

  return (
    <Card
      className={`shadow-sm ${
        sticky ? "sticky-sidebar" : ""
      } d-flex flex-column`}
    >
      <Card.Header>
        <strong>Tài khoản của tôi</strong>
      </Card.Header>

      {/* Danh sách mục – phần này có thể cuộn khi dài */}
      <ListGroup
        variant="flush"
        as="nav"
        aria-label="Tài khoản"
        className="scrollable-menu"
      >
        {items.map((i) => (
          <ListGroup.Item
            key={i.to}
            as={NavLink}
            to={i.to}
            end={i.to === "profile"}
            action
            className="d-flex align-items-center"
          >
            <i className={`${i.icon} me-2`} aria-hidden="true" />
            <span>{i.label}</span>
          </ListGroup.Item>
        ))}
      </ListGroup>

      {/* Khối dưới cùng: có spacer rồi mới tới Đăng xuất, cả cụm ghim đáy */}
      <div className="mt-auto">
        <div className="sidebar-gap" aria-hidden="true" />
        <ListGroup variant="flush" className="border-top">
          <ListGroup.Item
            as="button"
            type="button"
            action
            onClick={handleLogout}
            className="d-flex align-items-center text-start"
          >
            <i className="bi bi-box-arrow-right me-2" aria-hidden="true" />
            <span>Đăng xuất</span>
          </ListGroup.Item>
        </ListGroup>
      </div>
    </Card>
  );
}
