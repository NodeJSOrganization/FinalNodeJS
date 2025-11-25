import Logo from "../../assets/images/logo_white_space.png";
import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email) return setError("Vui lòng nhập email.");

    try {
      setLoading(true);
      // --- START: SỬA ENDPOINT TẠI ĐÂY ---
      // Endpoint đúng là '/api/auth/forgotpassword' (không có dấu gạch ngang)
      await axios.post("/api/auth/forgotpassword", { email }); 
      // --- END: SỬA ENDPOINT TẠI ĐÂY ---

      // Vì lý do bảo mật, luôn hiển thị thông điệp chung
      setSuccess(
        "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi đường link đặt lại mật khẩu tới hộp thư của bạn."
      );
    } catch (err) {
      // Không tiết lộ email có tồn tại hay không, vẫn hiển thị thông báo thành công
      // để tránh việc kẻ xấu dò email trong hệ thống.
      setSuccess(
        "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi đường link đặt lại mật khẩu tới hộp thư của bạn."
      );
    } finally {
      setLoading(false);
    }
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
          <h2 className="mt-3 mb-4 text-primary">Forgot Password</h2>
          <p className="text-muted mb-4">
            Nhập email để nhận liên kết đặt lại mật khẩu
          </p>

          {error && (
            <Alert variant="danger" className="w-75">
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="w-75">
              {success}
            </Alert>
          )}

          <Form className="w-75" onSubmit={onSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Chúng tôi sẽ gửi đường link tới email của bạn để đổi mật khẩu.
              </Form.Text>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" /> Đang
                  gửi...
                </>
              ) : (
                "Gửi"
              )}
            </Button>
          </Form>

          <p className="text-muted mt-3">
            Quay lại{" "}
            <a href="/login" className="text-primary">
              Đăng nhập
            </a>
          </p>
        </Col>

        <Col
          md={6}
          className="d-flex flex-column justify-content-center p-5 text-white"
          style={{ background: "linear-gradient(to right, #0d6efd, #6610f2)" }}
        >
          <h1>Need help accessing your account?</h1>
          <p>
            Nhập email để nhận liên kết đặt lại mật khẩu an toàn. Liên kết sẽ
            hết hạn sau một khoảng thời gian nhất định.
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;