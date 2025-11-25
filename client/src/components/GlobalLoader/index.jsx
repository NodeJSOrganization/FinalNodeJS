// src/components/common/GlobalLoader/index.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import './GlobalLoader.css';

const GlobalLoader = () => {
  // Lấy trạng thái isLoading từ Redux store
  const { isLoading } = useSelector((state) => state.ui);

  // Nếu không loading, không render gì cả
  if (!isLoading) {
    return null;
  }

  // Nếu đang loading, hiển thị overlay và spinner
  return (
    <div className="global-loader-overlay">
      <div className="global-loader-spinner">
        <Spinner animation="border" variant="light" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    </div>
  );
};

export default GlobalLoader;