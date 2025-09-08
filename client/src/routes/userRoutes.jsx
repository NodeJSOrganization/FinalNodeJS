import { Navigate } from "react-router-dom";
import accountRoutes from "./accountRoutes.jsx";

// Layout & pages (đổi import path theo dự án của bạn)
import UserLayout from "../layouts/user/UserLayout.jsx";
import Home from "../pages/customer/Home.jsx";
import Cart from "../pages/customer/CartPage.jsx";
import ProductCatalog from "../pages/product/ProductCatalog.jsx";
import ProductDetail from "../pages/product/ProductDetail.jsx";
import Order from "../pages/customer/Order.jsx";
import Payment from "../pages/customer/Payment.jsx";
import OrderSuccessPage from "../pages/customer/OrderSuccess.jsx";

const userRoutes = [
  {
    path: "/", // gốc cho toàn bộ frontend người dùng
    element: <UserLayout />,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      // Các trang khách hàng
      { path: "home", element: <Home /> },
      { path: ":category", element: <ProductCatalog /> },
      { path: ":category/:id", element: <ProductDetail /> },
      { path: "cart", element: <Cart /> },
      { path: "payment", element: <Payment /> },
      { path: "order", element: <Order /> },
      { path: "order-success", element: <OrderSuccessPage /> },

      // Lồng toàn bộ account routes để dùng chung UserLayout
      // accountRoutes hiện có path "/account" → vẫn hoạt động bình thường.
      // Nếu muốn relative, đổi path trong accountRoutes thành "account".
      ...accountRoutes,

      // 404 cho nhánh user
      //   { path: "*", element: <NotFound /> },
    ],
  },
];

export default userRoutes;
