// src/api/orderApi.js
import api from "./apiClient";

// Lấy tất cả đơn hàng của user đang đăng nhập
export const getMyOrders = () => api.get("/v1/orders/my");
