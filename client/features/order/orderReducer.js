import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { updateUserInState } from "../auth/authSlice";

const API_HOST = "https://provinces.open-api.vn/api/";

export const fetchProvinces = createAsyncThunk(
  "order/fetchProvinces",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_HOST}?depth=1`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchDistricts = createAsyncThunk(
  "order/fetchDistricts",
  async (provinceCode, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_HOST}p/${provinceCode}?depth=2`);
      return response.data.districts;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchWards = createAsyncThunk(
  "order/fetchWards",
  async (districtCode, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_HOST}d/${districtCode}?depth=2`);
      return response.data.wards;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (orderData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth;
      const config = { headers: { "Content-Type": "application/json" } };
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await axios.post("/api/v1/orders", orderData, config);
      if (response.data.updatedUser) {
        // Gọi action cập nhật User (Loyalty Points)
        thunkAPI.dispatch(updateUserInState(response.data.updatedUser));
      }
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.msg || "Lỗi khi tạo đơn hàng"
      );
    }
  }
);

const initialState = {
  customerInfo: null,
  createdOrder: null,
  orderItems: [],
  summary: {
    subtotal: 0,
    shippingFee: 0,
    voucherDiscount: 0,
    pointsDiscount: 0,
    finalTotal: 0,
  },
  selectedVoucher: null,
  usePoints: false,

  shippingInfo: {
    receiverName: "",
    receiverPhone: "",
    provinceCode: "",
    provinceName: "",
    districtCode: "",
    districtName: "",
    wardCode: "",
    wardName: "",
    detail: "",
    note: "",
  },
  provinces: [],
  districts: [],
  wards: [],
  status: {
    provinces: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    districts: "idle",
    wards: "idle",
  },
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    createOrderSummary: (state, action) => {
      const {
        orderItems,
        subtotal,
        voucherDiscount,
        pointsDiscount,
        finalTotal,
        selectedVoucher,
        usePoints,
      } = action.payload;
      state.orderItems = orderItems;
      state.summary = {
        ...state.summary,
        subtotal,
        voucherDiscount,
        pointsDiscount,
        finalTotal,
      };
      state.selectedVoucher = selectedVoucher;
      state.usePoints = usePoints;
    },
    saveCustomerInfo: (state, action) => {
      state.customerInfo = action.payload;
    },

    updateShippingInfo: (state, action) => {
      const { field, value } = action.payload;
      state.shippingInfo[field] = value;
    },
    resetDistrictAndWard: (state) => {
      state.shippingInfo.districtCode = "";
      state.shippingInfo.districtName = "";
      state.shippingInfo.wardCode = "";
      state.shippingInfo.wardName = "";
      state.shippingInfo.detail = "";
      state.districts = [];
      state.wards = [];
    },
    resetWard: (state) => {
      state.shippingInfo.wardCode = "";
      state.shippingInfo.wardName = "";
      state.shippingInfo.detail = "";
      state.wards = [];
    },
    clearOrderDetails: () => initialState,
    saveShippingInfo: (state, action) => {
      // action.payload sẽ là một object chứa receiverName, receiverPhone, fullAddress, ...
      state.shippingInfo = { ...state.shippingInfo, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProvinces.pending, (state) => {
        state.status.provinces = "loading";
      })
      .addCase(fetchProvinces.fulfilled, (state, action) => {
        state.status.provinces = "succeeded";
        state.provinces = action.payload;
      })
      .addCase(fetchProvinces.rejected, (state, action) => {
        state.status.provinces = "failed";
        state.error = action.payload;
      })
      .addCase(fetchDistricts.pending, (state) => {
        state.status.districts = "loading";
      })
      .addCase(fetchDistricts.fulfilled, (state, action) => {
        state.status.districts = "succeeded";
        state.districts = action.payload;
      })
      .addCase(fetchDistricts.rejected, (state, action) => {
        state.status.districts = "failed";
        state.error = action.payload;
      })
      .addCase(fetchWards.pending, (state) => {
        state.status.wards = "loading";
      })
      .addCase(fetchWards.fulfilled, (state, action) => {
        state.status.wards = "succeeded";
        state.wards = action.payload;
      })
      .addCase(fetchWards.rejected, (state, action) => {
        state.status.wards = "failed";
        state.error = action.payload;
      })
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.createdOrder = action.payload; // Lưu đơn hàng thành công
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  saveShippingInfo,
  createOrderSummary,
  updateShippingInfo,
  resetDistrictAndWard,
  resetWard,
  clearOrderDetails,
  saveCustomerInfo,
} = orderSlice.actions;

export default orderSlice.reducer;
