import "./App.css";
import { useRoutes, Navigate } from "react-router-dom";
// Admin pages
import adminRoutes from "./routes/adminRoutes.jsx";
import userRoutes from "./routes/userRoutes.jsx";

function App() {
  const allRoutes = useRoutes([
    // Khi truy cập trang gốc, tự động chuyển hướng đến admin dashboard
    { path: "/", element: <Navigate to="/account/profile" /> },
    // Admin routes (mảng) → spread
    ...adminRoutes,
    //Account routes (object Route) → đưa thẳng vào mảng
    ...userRoutes,
    // ...customerRoutes,
  ]);
  return <>{allRoutes}</>;
}

export default App;
