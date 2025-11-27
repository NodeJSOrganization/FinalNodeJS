// src/components/routing/AdminRoute.jsx

import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { Spinner } from "react-bootstrap";

const AdminRoute = ({ children }) => {
  const { user, isLoading } = useSelector((state) => state.auth);
  const location = useLocation();

  // 1. Nếu đang trong quá trình kiểm tra (ví dụ: refresh trang, đang fetch user từ token)
  //    thì hiển thị một spinner để tránh "nháy" màn hình.
  if (isLoading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (user && user.role === "admin") {
    return children;
  }
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default AdminRoute;
