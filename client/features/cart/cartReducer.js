import { createSlice } from "@reduxjs/toolkit";
import { DEMO_CART_ITEMS } from "../../src/data/DemoCartItems";

const initialState = {
  cartItems: DEMO_CART_ITEMS,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
    },
  },
});

export const { setCartItems } = cartSlice.actions;
export default cartSlice.reducer;
