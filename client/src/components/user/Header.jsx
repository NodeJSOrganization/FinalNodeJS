import { Navbar, Nav, Form, FormControl, Button } from "react-bootstrap";
import {
  FaSearch,
  FaShoppingCart,
  FaThLarge,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "../../styles/Header.css";
import Logo from "../../assets/images/logo_white_space.png";
import { logout } from "../../../features/auth/authSlice"; // action có sẵn

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user); // user được load từ localStorage nếu có :contentReference[oaicite:2]{index=2}

  const handleLogout = () => {
    dispatch(logout()); // clear user + token :contentReference[oaicite:3]{index=3}
    navigate("/");
  };

  const renderAuthArea = () => {
    if (user && user.role === "customer") {
      const avatarUrl = user?.avatar?.url;
      const displayName = user?.fullName || user?.email || "Tài khoản";
      return (
        <div className="d-flex align-items-center">
          <Link
            to="/account"
            className="nav-link d-flex align-items-center mx-2"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="me-2 rounded-circle"
                style={{ width: 28, height: 28, objectFit: "cover" }}
              />
            ) : (
              <div
                className="me-2 rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                style={{ width: 28, height: 28 }}
              >
                <FaUser size={14} />
              </div>
            )}
            <span
              className="d-none d-md-inline text-truncate"
              style={{ maxWidth: 140 }}
              title={displayName}
            >
              {displayName}
            </span>
          </Link>

          <Button
            variant="outline-secondary"
            className="custom-btn mx-2 d-flex align-items-center"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="me-2" />
            <span className="d-none d-md-inline">Đăng xuất</span>
          </Button>
        </div>
      );
    }

    if (user && user.role === "admin") {
      return (
        <div className="d-flex align-items-center">
          <Link to="/admin/dashboard" className="custom-btn nav-link mx-2">
            <FaUser size={18} />{" "}
            <span className="d-none d-md-inline">Admin</span>
          </Link>
          <Button
            variant="outline-secondary"
            className="custom-btn mx-2 d-flex align-items-center"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="me-2" />
            <span className="d-none d-md-inline">Đăng xuất</span>
          </Button>
        </div>
      );
    }

    return (
      <Link to="/login" className="custom-btn nav-link">
        <FaUser size={18} />{" "}
        <span className="d-none d-md-inline">Đăng nhập</span>
      </Link>
    );
  };

  return (
    <header className="w-100 bg-light">
      <div className="container">
        <Navbar
          bg="light"
          expand="lg"
          className="d-flex align-items-center justify-content-between"
          collapseOnSelect
        >
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <img
              className="img-thumbnail mx-auto d-block"
              src={Logo}
              alt="logo"
              style={{ width: "48px", height: "auto" }}
            />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Button as={Link} to="/products" variant="primary">
                <FaThLarge className="me-2" /> Danh mục
              </Button>
            </Nav>

            {/* <Form
              className="d-flex mx-auto my-2 my-lg-0 flex-grow-1"
              style={{ maxWidth: "300px", width: "100%" }}
            >
              <FormControl
                type="search"
                placeholder="Bạn muốn mua gì hôm nay?"
                className="me-2"
                aria-label="Search"
              />
              <Button variant="outline-secondary" className="custom-search-btn">
                <FaSearch />
              </Button>
            </Form> */}

            <Nav className="ms-auto align-items-center">
              <Link to="/cart" className="custom-btn mx-2 nav-link">
                <FaShoppingCart size={18} />{" "}
                <span className="d-none d-md-inline">Giỏ hàng</span>
              </Link>
              {renderAuthArea()}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    </header>
  );
};

export default Header;
