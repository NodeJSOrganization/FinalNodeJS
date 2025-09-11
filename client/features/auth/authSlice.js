// --- START OF FILE src/features/auth/authSlice.js ---

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Lấy thông tin user và token từ localStorage nếu có
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

// Định nghĩa trạng thái ban đầu cho slice
const initialState = {
  user: user ? user : null,
  token: token ? token : null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Tạo một "thunk" bất đồng bộ để xử lý việc gọi API đăng nhập
// Thunk này sẽ tự động quản lý các trạng thái pending, fulfilled, rejected
export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post('/api/auth/login', userData);
      if (response.data) {
        // Lưu thông tin vào localStorage để giữ đăng nhập khi tải lại trang
        localStorage.setItem('user', JSON.stringify(response.data.data));
        localStorage.setItem('token', response.data.token);
      }
      // Trả về dữ liệu thành công để slice xử lý
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.msg) ||
        error.message ||
        error.toString();
      // Trả về lỗi để slice xử lý
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Tạo Slice (bao gồm state, reducers, và extraReducers)
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  // Reducers đồng bộ: các hành động không cần gọi API
  reducers: {
    logout: (state) => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    updateUserInState: (state, action) => {
        state.user = action.payload;
        // Cập nhật lại localStorage
        localStorage.setItem('user', JSON.stringify(action.payload));
    }
  },
  
  // Extra Reducers: xử lý các trạng thái của thunk bất đồng bộ (loginUser)
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = '';
        state.user = action.payload.data; // Cập nhật user từ payload trả về
        state.token = action.payload.token; // Cập nhật token
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload; // Lấy thông báo lỗi từ payload
        state.user = null;
        state.token = null;
      });
  },
});

// Xuất ra action đồng bộ và reducer chính
export const { logout, updateUserInState } = authSlice.actions; 
export default authSlice.reducer;