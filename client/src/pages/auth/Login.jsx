// --- START OF FILE Login.jsx ---

import Logo from "../../assets/images/logo_white_space.png";
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  InputGroup,
  FormControl,
  Alert,
  Spinner,
} from "react-bootstrap";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // Import hooks của Redux
import  { loginUser } from "../../../features/auth/authSlice";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // State cục bộ cho input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Lấy state từ Redux store
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  // Xử lý chuyển hướng và các tác vụ phụ sau khi state Redux thay đổi
  useEffect(() => {
    if (isSuccess && user) {
      if (user.role === 'admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, isSuccess, navigate]);

  // Hàm xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      // Bạn có thể thêm validation ở đây nếu muốn
      return;
    }
    
    const userData = { email, password };
    // Gửi action đăng nhập đến Redux
    dispatch(loginUser(userData));
  };

  return (
    <Container
      fluid
      className="vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "linear-gradient(to right, #ffffff, #0d6efd)" }}
    >
      <Row
        style={{ maxWidth: "1400px", margin: "0 auto", borderRadius: "8px" }}
      >
        <Col
          md={6}
          className="d-flex flex-column justify-content-center align-items-center p-5 bg-white"
        >
          <img
            className="img-thumbnail d-block mb-2"
            style={{ width: "8rem", height: "6rem" }}
            src={Logo}
            alt="logo"
          />
          <h2 className="mt-3 mb-4 text-primary">Computer Store Login</h2>
          <p className="text-muted mb-4">Please login to your account</p>
          
          {/* Hiển thị lỗi từ Redux state */}
          {isError && <Alert variant="danger" className="w-75">{message}</Alert>}

          <Form className="w-75" onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <InputGroup>
                <FormControl
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputGroup.Text
                  onClick={togglePasswordVisibility}
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>
            
            <Button variant="primary" type="submit" className="w-100 mb-3" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Đang đăng nhập...
                </>
              ) : (
                "LOG IN"
              )}
            </Button>
          </Form>
          <a href="/forgot-password" className="text-primary mb-3">
            Forgot password?
          </a>
          <p className="text-muted">
            Don't have an account?{" "}
            <a href="/signup" className="text-danger">
              CREATE NEW
            </a>
          </p>
          <div className="d-flex justify-content-center mt-3">
            <Button variant="outline-primary" className="me-2">
              Login with Google
            </Button>
            <Button variant="outline-primary">Login with Facebook</Button>
          </div>
        </Col>
        <Col
          md={6}
          className="d-flex flex-column justify-content-center p-5 text-white"
          style={{ background: "linear-gradient(to right, #0d6efd, #6610f2)" }}
        >
          <h1>We are more than just a store</h1>
          <p>
            Log in to explore our wide range of high-performance computers and
            top-quality computer components. Discover the latest hardware to
            build your perfect system.
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;