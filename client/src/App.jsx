import "./App.css";
import { useRoutes, Navigate } from "react-router-dom";
// Admin pages
import adminRoutes from "./routes/adminRoutes.jsx";
import accountRoutes from "./routes/accountRoutes.jsx";

function App() {
  const allRoutes = useRoutes([
    // Khi truy cập trang gốc, tự động chuyển hướng đến admin dashboard
    { path: "/", element: <Navigate to="/account/profile" /> },
    // Admin routes (mảng) → spread
    ...adminRoutes,
    //Account routes (object Route) → đưa thẳng vào mảng
    ...accountRoutes,
    // ...customerRoutes,
  ]);
  return <>{allRoutes}</>;
}

export default App;
