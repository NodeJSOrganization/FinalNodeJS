import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getGuestCartFromStorage = () =>
  JSON.parse(localStorage.getItem("guestCart")) || [];

const setGuestCartInStorage = (items) =>
  localStorage.setItem("guestCart", JSON.stringify(items));

export const syncCart = createAsyncThunk(
  "cart/syncCart",
  async (_, thunkAPI) => {
    const { user, token } = thunkAPI.getState().auth;
    const guestCartItems = getGuestCartFromStorage();
    try {
      if (user) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        if (guestCartItems.length > 0) {
          const response = await axios.post(
            "/api/v1/cart/merge",
            { guestCartItems },
            config
          );
          localStorage.removeItem("guestCart");
          return response.data.data;
        } else {
          const response = await axios.get("/api/v1/cart", config);
          return response.data.data;
        }
      } else {
        return guestCartItems;
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.msg || "Lỗi đồng bộ giỏ hàng"
      );
    }
  }
);

export const addItem = createAsyncThunk(
  "cart/addItem",
  async (itemData, thunkAPI) => {
    const { user, token } = thunkAPI.getState().auth;
    const { productSnapshot, variantSnapshot, quantity, productId, variantId } =
      itemData;
    try {
      if (user) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post(
          "/api/v1/cart",
          { productId, variantId, quantity },
          config
        );
        return response.data.data;
      } else {
        const cart = getGuestCartFromStorage();
        const itemIndex = cart.findIndex(
          (i) => i.variant._id === variantSnapshot._id
        );
        if (itemIndex > -1) {
          cart[itemIndex].quantity += quantity;
        } else {
          cart.push({
            product: productSnapshot,
            variant: variantSnapshot,
            quantity,
          });
        }
        setGuestCartInStorage(cart);
        return cart;
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.msg || "Lỗi khi thêm sản phẩm"
      );
    }
  }
);

export const updateItemQuantity = createAsyncThunk(
  "cart/updateItemQuantity",
  async ({ variantId, quantity }, thunkAPI) => {
    const { user, token } = thunkAPI.getState().auth;
    try {
      if (user) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.put(
          `/api/v1/cart/${variantId}`,
          { quantity },
          config
        );
        return response.data.data;
      } else {
        let cart = getGuestCartFromStorage();
        if (quantity <= 0) {
          cart = cart.filter((item) => item.variant._id !== variantId);
        } else {
          const itemIndex = cart.findIndex((i) => i.variant._id === variantId);
          if (itemIndex > -1) {
            cart[itemIndex].quantity = quantity;
          }
        }
        setGuestCartInStorage(cart);
        return cart;
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.msg || "Lỗi khi cập nhật số lượng"
      );
    }
  }
);

export const removeItem = createAsyncThunk(
  "cart/removeItem",
  async (variantId, thunkAPI) => {
    const { user, token } = thunkAPI.getState().auth;
    try {
      if (user) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.delete(
          `/api/v1/cart/${variantId}`,
          config
        );
        return response.data.data;
      } else {
        let cart = getGuestCartFromStorage();
        cart = cart.filter((item) => item.variant._id !== variantId);
        setGuestCartInStorage(cart);
        return cart;
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.msg || "Lỗi khi xóa sản phẩm"
      );
    }
  }
);

export const fetchVouchers = createAsyncThunk(
  "cart/fetchVouchers",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get("/api/v1/discounts");
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.msg || "Lỗi khi tải voucher"
      );
    }
  }
);

const initialState = {
  cartItems: [],
  isLoading: false,
  error: null,
  selectedVoucher: null,
  usePoints: false,
  vouchers: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
    },
    toggleItem: (state, action) => {
      const { variantId, checked } = action.payload;
      const item = state.cartItems.find((x) => x.variant?._id === variantId);
      if (item) {
        item.checked = checked;
      }
    },
    toggleAllItems: (state, action) => {
      const checked = action.payload;
      state.cartItems = state.cartItems.map((item) => ({ ...item, checked }));
    },
    changeQty: (state, action) => {
      const { variantId, delta } = action.payload;
      const item = state.cartItems.find((x) => x.variant?._id === variantId);
      if (item) {
        item.quantity = Math.max(1, item.quantity + delta);
      }
    },
    removeSelected: (state) => {
      state.cartItems = state.cartItems.filter((item) => !item.checked);
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.selectedVoucher = null;
      state.usePoints = false;
      localStorage.removeItem("guestCart");
    },
    applyVoucher: (state, action) => {
      state.selectedVoucher = action.payload;
    },
    clearVoucher: (state) => {
      state.selectedVoucher = null;
    },
    toggleUsePoints: (state, action) => {
      state.usePoints = action.payload;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.isLoading = true;
      state.error = null;
    };
    const handleRejected = (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    };

    const handleFulfilled = (state, action) => {
      state.isLoading = false;
      const oldCheckedState = new Map(
        state.cartItems.map((item) => [
          item.variant._id.toString(),
          item.checked,
        ])
      );
      state.cartItems = action.payload.map((newItem) => ({
        ...newItem,
        checked: oldCheckedState.get(newItem.variant._id.toString()) || false,
      }));
    };

    builder
      .addCase(syncCart.pending, handlePending)
      .addCase(syncCart.fulfilled, handleFulfilled)
      .addCase(syncCart.rejected, handleRejected)

      .addCase(addItem.pending, handlePending)
      .addCase(addItem.fulfilled, handleFulfilled)
      .addCase(addItem.rejected, handleRejected)

      .addCase(updateItemQuantity.pending, handlePending)
      .addCase(updateItemQuantity.fulfilled, handleFulfilled)
      .addCase(updateItemQuantity.rejected, handleRejected)

      .addCase(removeItem.pending, handlePending)
      .addCase(removeItem.fulfilled, handleFulfilled)
      .addCase(removeItem.rejected, handleRejected)

      .addCase(fetchVouchers.pending, (state) => {
        // Có thể thêm state loading riêng cho voucher nếu cần
      })
      .addCase(fetchVouchers.fulfilled, (state, action) => {
        state.vouchers = action.payload;
      })
      .addCase(fetchVouchers.rejected, (state, action) => {
        // Xử lý lỗi khi không tải được voucher
        console.error("Lỗi fetchVouchers:", action.payload);
      });
  },
});

export const {
  setCartItems,
  toggleItem,
  toggleAllItems,
  changeQty,
  removeSelected,
  clearCart,
  applyVoucher,
  clearVoucher,
  toggleUsePoints,
} = cartSlice.actions;

export default cartSlice.reducer;
