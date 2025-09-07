import Logo from "../../assets/images/logo_white_space.png";
import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const onChangePassword = (e) => {
    setPassword(e.target.value);
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
          <Form className="w-75">
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={onChangeEmail}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <InputGroup>
                <FormControl
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={onChangePassword}
                />
                <InputGroup.Text
                  onClick={togglePasswordVisibility}
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mb-3">
              LOG IN
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
