import Header from "../../components/user/Header";
import { Outlet } from "react-router-dom";
import Footer from "../../components/user/Footer";

const Layout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />

      <main className="flex-grow-1 py-3">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
