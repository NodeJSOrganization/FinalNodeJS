import Logo from "../../assets/images/logo_white_space.png";
import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  InputGroup,
  FormControl,
  ProgressBar,
  Spinner,
} from "react-bootstrap";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * ResetPassword (fixed layout for logo cut & black corners)
 */
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token)
      setError(
        "Liên kết không hợp lệ hoặc đã hết hạn (thiếu token). Vui lòng yêu cầu lại."
      );
  }, [token]);

  const rules = useMemo(() => {
    const hasMin8 = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasDigit = /\d/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    return { hasMin8, hasUpper, hasLower, hasDigit, hasSpecial };
  }, [newPassword]);

  const strength = useMemo(() => {
    const score = Object.values(rules).filter(Boolean).length; // 0..5
    const percent = Math.round((score / 5) * 100);
    const label =
      score <= 2
        ? "Yếu"
        : score === 3
        ? "Trung bình"
        : score === 4
        ? "Mạnh"
        : "Rất mạnh";
    const variant =
      score <= 2
        ? "danger"
        : score === 3
        ? "warning"
        : score === 4
        ? "info"
        : "success";
    return { percent, label, variant };
  }, [rules]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setError("");

    if (!newPassword || !confirm)
      return setError("Vui lòng nhập đầy đủ mật khẩu mới.");
    if (newPassword !== confirm)
      return setError("Hai mật khẩu mới không khớp.");
    if (Object.values(rules).filter(Boolean).length < 4)
      return setError("Mật khẩu mới chưa đủ mạnh.");

    try {
      setLoading(true);
      await axios.post("/api/auth/reset-password", { token, newPassword });
      setSuccess(
        "Đặt lại mật khẩu thành công. Đang chuyển về trang đăng nhập..."
      );
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="min-vh-100 d-flex justify-content-center align-items-stretch py-5"
      style={{ background: "linear-gradient(90deg, #ffffff, #0d6efd)" }}
    >
      <Row
        className="w-100 shadow-lg rounded-4 overflow-hidden"
        style={{ maxWidth: "1200px", margin: "0 auto", background: "#fff" }}
      >
        <Col
          md={6}
          className="bg-white d-flex flex-column justify-content-center align-items-center p-5"
        >
          <img
            className="d-block mb-2"
            style={{ width: "8rem", height: "auto", objectFit: "contain" }}
            src={Logo}
            alt="logo"
          />
          <h2 className="mt-3 mb-4 text-primary">Reset Password</h2>
          <p className="text-muted mb-4">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>

          {error && (
            <Alert variant="danger" className="w-75 text-start">
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="w-75 text-start">
              {success}
            </Alert>
          )}

          <Form className="w-75" onSubmit={onSubmit}>
            <Form.Group className="mb-3" controlId="formNewPass">
              <Form.Label className="fw-semibold text-start w-100">
                Mật khẩu mới
              </Form.Label>
              <InputGroup>
                <FormControl
                  type={show1 ? "text" : "password"}
                  placeholder="Tối thiểu 8 ký tự, gồm chữ hoa, thường, số..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={() => setShow1((s) => !s)}
                >
                  {show1 ? <FaRegEye /> : <FaRegEyeSlash />}
                </Button>
              </InputGroup>
              <div className="mt-2">
                <ProgressBar
                  now={strength.percent}
                  variant={strength.variant}
                />
                <div className="small text-muted mt-1">
                  Độ mạnh: {strength.label}
                </div>
              </div>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formConfirmPass">
              <Form.Label className="fw-semibold text-start w-100">
                Nhập lại mật khẩu mới
              </Form.Label>
              <InputGroup>
                <FormControl
                  type={show2 ? "text" : "password"}
                  placeholder="Nhập lại để xác nhận"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={() => setShow2((s) => !s)}
                >
                  {show2 ? <FaRegEye /> : <FaRegEyeSlash />}
                </Button>
              </InputGroup>
            </Form.Group>

            <div className="mt-2 p-2 border rounded bg-light">
              <div className="fw-semibold mb-2">Mật khẩu nên có:</div>
              <ul className="mb-0 small text-start w-100">
                <li className={rules.hasMin8 ? "text-success fw-bold" : ""}>
                  Tối thiểu 8 ký tự
                </li>
                <li className={rules.hasUpper ? "text-success fw-bold" : ""}>
                  Ít nhất 1 chữ hoa (A Z)
                </li>
                <li className={rules.hasLower ? "text-success fw-bold" : ""}>
                  Ít nhất 1 chữ thường (a z)
                </li>
                <li className={rules.hasDigit ? "text-success fw-bold" : ""}>
                  Ít nhất 1 chữ số (0 9)
                </li>
                <li className={rules.hasSpecial ? "text-success fw-bold" : ""}>
                  Ít nhất 1 ký tự đặc biệt (@ # $ % ...)
                </li>
              </ul>
            </div>

            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-3"
              disabled={loading || !token}
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" /> Đang
                  xác nhận...
                </>
              ) : (
                "Xác nhận"
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
          className="d-flex flex-column justify-content-center p-5 text-white h-100"
          style={{ background: "linear-gradient(90deg, #0d6efd, #6610f2)" }}
        >
          <h1>Set a new password</h1>
          <p>
            Mật khẩu mới sẽ có hiệu lực ngay sau khi đặt lại thành công. Vì lý
            do bảo mật, liên kết reset có thể hết hạn sau một thời gian.
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
