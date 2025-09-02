import "./App.css";
import { Route, Routes } from "react-router-dom";
// User pages
import ForgotPassword from "./pages/auth/ForgotPasswordPage.jsx";
import ResetPassword from "./pages/auth/ResetPasswordPage.jsx";
import Cart from "./pages/account/CartPage.jsx";
import Profile from "./pages/account/AccountProfilePage.jsx";
import ChangePassword from "./pages/account/ChangePasswordPage.jsx";
import AddressBook from "./pages/account/AddressBookPage.jsx";
import OrderHistory from "./pages/account/OrderHistoryPage.jsx";
// Admin pages

function App() {
  return (
    <div className="main-content">
      <Routes>
        {/* User routes */}
        {/* mấy cái id đáng lẽ là ghi :id mà đang code frontend trước nên để id nha*/}
        <Route path="/account/id" element={<Profile />} />
        <Route path="/account/id/cart" element={<Cart />} />
        <Route
          path="/account/id/change-password"
          element={<ChangePassword />}
        />
        <Route path="/account/id/address-book" element={<AddressBook />} />
        <Route path="/account/id/order-history" element={<OrderHistory />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* mấy cái token đáng lẽ là ghi :token mà đang code frontend trước nên để token nha*/}
        <Route path="/reset-password/token" element={<ResetPassword />} />
        {/* Admin routes */}
      </Routes>
    </div>
  );
}

export default App;
