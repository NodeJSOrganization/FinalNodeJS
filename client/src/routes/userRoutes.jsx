import { Navigate } from "react-router-dom";
import accountRoutes from "./accountRoutes.jsx";

// Layout & pages (đổi import path theo dự án của bạn)
import UserLayout from "../layouts/user/UserLayout.jsx";
import Home from "../pages/Home.jsx";
import Cart from "../pages/CartPage.jsx";
import Login from "../pages/auth/Login.jsx";
import Signup from "../pages/auth/Signup.jsx";

const userRoutes = [
  {
    path: "/", // gốc cho toàn bộ frontend người dùng
    element: <UserLayout />,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      // Các trang khách hàng
      { path: "home", element: <Home /> },

      // Cart & Checkout
      { path: "cart", element: <Cart /> },

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
