// src/features/ui/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Action để bật loading
    showLoading: (state) => {
      state.isLoading = true;
    },
    // Action để tắt loading
    hideLoading: (state) => {
      state.isLoading = false;
    },
  },
});

// Export các actions để có thể sử dụng ở nơi khác
export const { showLoading, hideLoading } = uiSlice.actions;

// Export reducer
export default uiSlice.reducer;