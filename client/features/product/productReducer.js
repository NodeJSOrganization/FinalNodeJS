import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    getProductStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getProductSuccess: (state, action) => {
      state.isLoading = false;
      state.selectedProduct = action.payload;
    },
    getProductFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
});

export const {
  setProducts,
  getProductStart,
  getProductSuccess,
  getProductFailure,
  clearSelectedProduct,
} = productSlice.actions;

export default productSlice.reducer;
