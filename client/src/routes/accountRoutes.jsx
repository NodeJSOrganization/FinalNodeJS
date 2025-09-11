import { Navigate } from "react-router-dom";
import AccountLayout from "../layouts/account/AccountLayout.jsx";
//
import AccountProfile from "../pages/account/AccountProfile/index.jsx";
import AccountOrderHistory from "../pages/account/AccountOrderHistory/index.jsx";
import AccountAddress from "../pages/account/AccountAddress/index.jsx";
import AccountChangePassword from "../pages/account/AccountChangePassword/index.jsx";


const accountRoutes = [
  {
    path: "/account",
    element: <AccountLayout />,
    children: [
      { index: true, element: <Navigate to="profile" replace /> },
      { path: "profile", element: <AccountProfile /> },
      { path: "orders", element: <AccountOrderHistory /> },
      { path: "addresses", element: <AccountAddress /> },
      { path: "change-password", element: <AccountChangePassword /> },
    ],
  },
];

export default accountRoutes;
