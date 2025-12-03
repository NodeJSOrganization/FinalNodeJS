import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // trùng với index.js
});

// Tự động gắn Authorization: Bearer token cho mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
