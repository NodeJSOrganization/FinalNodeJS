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

export default function AccountSidebar({ sticky = false }) {
  return (
    <Card className={`shadow-sm ${sticky ? "sticky-sidebar" : ""}`}>
      <Card.Header>
        <strong>Tài khoản của tôi</strong>
      </Card.Header>
      <ListGroup variant="flush">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `list-group-item list-group-item-action d-flex align-items-center ${
                isActive ? "active" : ""
              }`
            }
          >
            <i className={`${item.icon} me-2`} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </ListGroup>
    </Card>
  );
}
