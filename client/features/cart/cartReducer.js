// import { createSlice } from "@reduxjs/toolkit";
// import { DEMO_CART_ITEMS } from "../../src/data/DemoCartItems";

// const initialState = {
//   cartItems: DEMO_CART_ITEMS,
//   selectedVoucher: null,
//   usePoints: false,
// };

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     setCartItems: (state, action) => {
//       state.cartItems = action.payload;
//     },
//     toggleAllItems: (state, action) => {
//       const checked = action.payload;
//       state.cartItems = state.cartItems.map((item) => ({
//         ...item,
//         checked,
//       }));
//     },
//     toggleItem: (state, action) => {
//       const { id, checked } = action.payload;
//       state.cartItems = state.cartItems.map((item) =>
//         item.id === id ? { ...item, checked } : item
//       );
//     },
//     changeQty: (state, action) => {
//       const { id, delta } = action.payload;
//       state.cartItems = state.cartItems.map((item) =>
//         item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
//       );
//     },
//     removeItem: (state, action) => {
//       const id = action.payload;
//       state.cartItems = state.cartItems.filter((item) => item.id !== id);
//     },
//     removeSelected: (state) => {
//       state.cartItems = state.cartItems.filter((item) => !item.checked);
//     },
//     applyVoucher: (state, action) => {
//       state.selectedVoucher = action.payload;
//     },
//     clearVoucher: (state) => {
//       state.selectedVoucher = null;
//     },
//     toggleUsePoints: (state, action) => {
//       state.usePoints = action.payload;
//     },
//   },
// });

// export const {
//   setCartItems,
//   toggleAllItems,
//   toggleItem,
//   changeQty,
//   removeItem,
//   removeSelected,
//   applyVoucher,
//   clearVoucher,
//   toggleUsePoints,
// } = cartSlice.actions;
// export default cartSlice.reducer;

// src/features/cart/cartReducer.js

import { createSlice } from "@reduxjs/toolkit";
import { DEMO_CART_ITEMS } from "../../src/data/DemoCartItems";

const initialState = {
  cartItems: DEMO_CART_ITEMS,
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
      state.cartItems = state.cartItems.map((item) => ({
        ...item,
        checked,
      }));
    },
    toggleItem: (state, action) => {
      const { id, checked } = action.payload;
      state.cartItems = state.cartItems.map((item) =>
        item.id === id ? { ...item, checked } : item
      );
    },
    changeQty: (state, action) => {
      const { id, delta } = action.payload;
      state.cartItems = state.cartItems.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      );
    },
    removeItem: (state, action) => {
      const id = action.payload;
      state.cartItems = state.cartItems.filter((item) => item.id !== id);
    },
    removeSelected: (state) => {
      state.cartItems = state.cartItems.filter((item) => !item.checked);
    },
    // Action để xóa các sản phẩm đã chọn sau khi đặt hàng thành công
    clearSelectedItems: (state) => {
      state.cartItems = state.cartItems.filter((item) => !item.checked);
      // Reset luôn voucher và điểm thưởng
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
      state.usePoints = action.payload; // Nhận giá trị true/false trực tiếp
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
