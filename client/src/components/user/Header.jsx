import {
  Navbar,
  Nav,
  Form,
  FormControl,
  Button,
  NavDropdown,
} from "react-bootstrap";
import { FaSearch, FaShoppingCart, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../../styles/Header.css";
import Logo from "../../assets/images/logo_white_space.png";

const Header = () => {
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
              <NavDropdown
                title={
                  <Link className="custom-btn text-decoration-none text-white">
                    Danh mục
                  </Link>
                }
                id="basic-nav-dropdown"
                className="mx-2"
              >
                <Link className="dropdown-item" to="/laptops">
                  Laptops
                </Link>
                <Link className="dropdown-item" to="/monitors">
                  Monitors
                </Link>
                <Link className="dropdown-item" to="/hard-drives">
                  Hard Drives
                </Link>
              </NavDropdown>
            </Nav>

            {/* Search Form */}
            <Form
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
            </Form>

            <Nav className="ms-auto">
              <Link to="/cart" className="custom-btn mx-2 nav-link">
                <FaShoppingCart size={18} />{" "}
                <span className="d-none d-md-inline">Giỏ hàng</span>
              </Link>
              <Link to="/login" className="custom-btn nav-link">
                <FaUser size={18} />{" "}
                <span className="d-none d-md-inline">Đăng nhập</span>
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    </header>
  );
};

export default Header;
