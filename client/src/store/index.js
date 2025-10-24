import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../../features/product/productReducer";
import cartReducer from "../../features/cart/cartReducer";
import userReducer from "../../features/user/userReducer";
import orderReducer from "../../features/order/orderReducer";
import authReducer from "../../features/auth/authSlice";
import uiReducer from "../../features/ui/uiSlice"; 

const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    product: productReducer,
    cart: cartReducer,
    user: userReducer,
    order: orderReducer,
  },
});

export default store;
