import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../../features/product/productReducer";
import cartReducer from "../../features/cart/cartReducer";
import userReducer from "../../features/user/userReducer";
import authReducer from "../../features/auth/authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
    user: userReducer,
  },
});

export default store;
