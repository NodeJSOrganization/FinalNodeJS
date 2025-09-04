// src/data/dashboardData.js
import { mockProducts, mockUsers, mockOrders } from './mockData';

// --- Dữ liệu cho Simple Dashboard ---
export const getSimpleDashboardData = () => {
  const totalRevenue = mockOrders
    .filter(o => o.status === 'Hoàn thành')
    .reduce((sum, order) => sum + order.total, 0);

  // Tạo dữ liệu best-selling giả định nhưng lấy thông tin thật từ mockProducts
  const bestSellingData = [
    { id: 'SP001', sold: 120 },
    { id: 'SP003', sold: 95 },
    { id: 'SP004', sold: 88 },
    { id: 'SP002', sold: 76 },
    { id: 'SP005', sold: 65 },
  ];

  const bestSellingProducts = bestSellingData.map(item => {
    const productInfo = mockProducts.find(p => p.id === item.id);
    return {
      ...productInfo, // Lấy tất cả thông tin (name, image, price...)
      sold: item.sold,
      revenue: productInfo.price * item.sold, // Tính toán doanh thu
    };
  });

  return {
    totalUsers: mockUsers.length,
    newUsersThisMonth: 5,
    totalOrders: mockOrders.length,
    totalRevenue: totalRevenue,
    bestSellingProducts: bestSellingProducts, // Dữ liệu mới, đầy đủ hơn
  };
};

// --- Dữ liệu cho Advanced Dashboard ---
// Hàm này tạo ra dữ liệu giả định cho 12 tháng qua
export const getAdvancedDashboardData = () => {
  const data = [];
  const labels = [];
  const today = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthLabel = `${date.getMonth() + 1}/${date.getFullYear()}`;
    labels.push(monthLabel);

    const revenue = Math.floor(Math.random() * (200 - 80 + 1) + 80) * 1000000;
    const profit = revenue * (Math.random() * (0.4 - 0.2) + 0.2); // Lợi nhuận từ 20-40%
    const orders = Math.floor(Math.random() * (150 - 50 + 1) + 50);

    data.push({
      date: monthLabel,
      revenue,
      profit,
      orders,
    });
  }
  return data;
};

export const getSalesByCategory = () => {
  return {
    labels: ['Laptop', 'Phụ kiện', 'Màn hình'],
    data: [120000000, 45000000, 32000000], // Doanh thu giả định
  };
};