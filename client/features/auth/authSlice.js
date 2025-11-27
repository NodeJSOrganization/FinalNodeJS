import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { syncCart, clearCart } from "../cart/cartReducer";

const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

const initialState = {
  user: user ? user : null,
  token: token ? token : null,
  isAuthenticated: !!(user && token),
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post("/api/auth/login", userData);

      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
        localStorage.setItem("token", response.data.token);
      }

      await thunkAPI.dispatch(syncCart());

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.msg || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Tạo Slice (bao gồm state, reducers, và extraReducers)
export const authSlice = createSlice({
  name: "auth",
  initialState,
  // Reducers đồng bộ: các hành động không cần gọi API
  reducers: {
    // **THAY ĐỔI LOGIC LOGOUT ĐỂ CLEAR GIỎ HÀNG**
    logout: (state) => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("guestCart"); // Xóa cả giỏ hàng của khách khi logout
      state.user = null;
      state.token = null;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
      state.isAuthenticated = false;
    },
    updateUserInState: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
  },

  // Extra Reducers: xử lý các trạng thái của thunk bất đồng bộ (loginUser)
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false; // Reset lỗi khi bắt đầu request mới
        state.isSuccess = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = "";
        state.isAuthenticated = true;
        state.user = action.payload.data; // Cập nhật user từ payload trả về
        state.token = action.payload.token; // Cập nhật token
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isAuthenticated = false;
        state.message = action.payload; // Lấy thông báo lỗi từ payload
        state.user = null;
        state.token = null;
      });
  },
});

// Xuất ra action đồng bộ và reducer chính
export const { logout, updateUserInState } = authSlice.actions;
export default authSlice.reducer;
