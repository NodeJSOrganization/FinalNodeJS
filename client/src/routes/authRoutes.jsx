import Login from "../pages/auth/Login.jsx";
import Signup from "../pages/auth/Signup.jsx";
import ForgotPassword from "../pages/auth/ForgotPasswordPage.jsx";
import ResetPassword from "../pages/auth/ResetPasswordPage.jsx";

const authRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },

  // Reset password: hỗ trợ cả không token và có token trên URL
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/reset-password/:token", element: <ResetPassword /> },
];

export default authRoutes;
