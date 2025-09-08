import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../../features/product/productReducer";
import cartReducer from "../../features/cart/cartReducer";
import userReducer from "../../features/user/userReducer";

const store = configureStore({
  reducer: {
    product: productReducer,
    cart: cartReducer,
    user: userReducer,
  },
});

export default store;
