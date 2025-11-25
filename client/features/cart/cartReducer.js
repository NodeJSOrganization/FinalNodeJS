import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  selectedVoucher: null,
  usePoints: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
    },

    toggleAllItems: (state, action) => {
      const checked = action.payload;
      state.cartItems = state.cartItems.map((item) => ({ ...item, checked }));
    },

    toggleItem: (state, action) => {
      const { variantId, checked } = action.payload;
      const item = state.cartItems.find((x) => x.variantId === variantId);
      if (item) {
        item.checked = checked;
      }
    },

    changeQty: (state, action) => {
      const { variantId, delta } = action.payload;
      const item = state.cartItems.find((x) => x.variantId === variantId);
      if (item) {
        item.quantity = Math.max(1, item.quantity + delta);
      }
    },

    removeItem: (state, action) => {
      const variantId = action.payload;
      state.cartItems = state.cartItems.filter(
        (x) => x.variantId !== variantId
      );
    },

    removeSelected: (state) => {
      state.cartItems = state.cartItems.filter((item) => !item.checked);
    },

    clearSelectedItems: (state) => {
      state.cartItems = state.cartItems.filter((item) => !item.checked);
      state.selectedVoucher = null;
      state.usePoints = false;
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
});

export const {
  setCartItems,
  toggleAllItems,
  toggleItem,
  changeQty,
  removeItem,
  removeSelected,
  clearSelectedItems, // Export action mới
  applyVoucher,
  clearVoucher,
  toggleUsePoints,
} = cartSlice.actions;

export default cartSlice.reducer;
