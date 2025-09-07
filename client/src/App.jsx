import "./App.css";
import { useRoutes, Navigate } from "react-router-dom";
// Admin pages
import authRoutes from "./routes/authRoutes.jsx";
import userRoutes from "./routes/userRoutes.jsx";
import adminRoutes from "./routes/adminRoutes.jsx";

function App() {
  const allRoutes = useRoutes([
    // Khi truy cập trang gốc, tự động chuyển hướng đến admin dashboard
    { path: "/", element: <Navigate to="/home" /> },
    ...authRoutes,
    //Account routes (object Route) → đưa thẳng vào mảng
    ...userRoutes,
    // Admin routes (mảng) → spread
    ...adminRoutes,
    // ...customerRoutes,
  ]);
  return <>{allRoutes}</>;
}

export default App;
