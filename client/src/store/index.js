import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../../features/product/productReducer";
import cartReducer from "../../features/cart/cartReducer";
import userReducer from "../../features/user/userReducer";
import orderReducer from "../../features/order/orderReducer";

const store = configureStore({
  reducer: {
    product: productReducer,
    cart: cartReducer,
    user: userReducer,
    order: orderReducer,
  },
});

export default store;
