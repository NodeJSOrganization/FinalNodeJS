// src/components/routing/AdminRoute.jsx

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

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

  // 2. Nếu đã kiểm tra xong, có thông tin user VÀ user đó là admin
  if (user && user.role === 'admin') {
    // Cho phép truy cập vào trang admin mà họ yêu cầu (children)
    return children;
  }

  // 3. Nếu không phải admin (chưa đăng nhập hoặc role là customer)
  //    Chuyển hướng họ về trang login.
  //    `state={{ from: location }}` là để sau khi đăng nhập thành công,
  //    có thể chuyển hướng họ trở lại trang admin họ đang cố vào.
  //    `replace` để không lưu trang admin vào lịch sử trình duyệt.
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default AdminRoute;