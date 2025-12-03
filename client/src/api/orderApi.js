// src/api/orderApi.js
import api from "./apiClient";

// Lấy tất cả đơn hàng của user đang đăng nhập
export const getMyOrders = () => api.get("/v1/orders/myorders");

// Hủy 1 đơn hàng của user hiện tại
export const cancelMyOrder = (orderId) => api.patch(`/v1/orders/${orderId}/cancel`);

// Kiểm tra tồn kho cho “mua lại”
export const checkReorderStock = (orderItems) => api.post("/v1/orders/check-reorder", { orderItems });