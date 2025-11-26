import api from './apiClient';

// Lấy thông tin "me" để fill vào Account
export const getMe = () => api.get('/v1/users/me');

// Cập nhật profile
export const updateMe = (data) => {
  if (data instanceof FormData) {
    return api.put("/v1/users/updateme", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return api.put("/v1/users/updateme", data);
};

// Đổi mật khẩu trong Account
export const changePassword = (payload) =>
  api.put('/auth/changepassword', payload);
