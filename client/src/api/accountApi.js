import api from './apiClient';

// Lấy thông tin "me" để fill vào Account
export const getMe = () => api.get('/v1/users/me');

// Cập nhật profile
export const updateMe = (payload) =>
  api.put("/v1/users/updateme", payload);

// Đổi mật khẩu trong Account
export const changePassword = (payload) =>
  api.put('/auth/changepassword', payload);
