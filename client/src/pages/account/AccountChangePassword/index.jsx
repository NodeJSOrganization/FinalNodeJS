import { useMemo, useState } from "react";
import axios from "axios";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Alert,
  InputGroup,
  ProgressBar,
  Spinner,
} from "react-bootstrap";

/**
 * AccountChangePassword
 * Flow:
 * 1) VERIFY: Nhập mật khẩu hiện tại -> Xác nhận
 * 2) NEW: Nhập mật khẩu mới (2 lần) -> Đổi mật khẩu
 * 3) DONE: Hiển thị đã đổi mật khẩu thành công
 *
 * Backend gợi ý (tuỳ bạn đổi path theo server):
 *  - POST /api/account/verify-password { currentPassword }
 *      -> 200 OK { ok: true }
 *  - POST /api/account/change-password { currentPassword, newPassword }
 *      -> 200 OK { ok: true }
 */
export default function AccountChangePassword() {
  const [step, setStep] = useState("VERIFY"); // VERIFY | NEW | DONE

  // VERIFY state
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);

  // NEW state
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [showNew1, setShowNew1] = useState(false);
  const [showNew2, setShowNew2] = useState(false);

  // UX
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ===== Password rules & strength =====
  const rules = useMemo(() => {
    const hasMin8 = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasDigit = /\d/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    return { hasMin8, hasUpper, hasLower, hasDigit, hasSpecial };
  }, [newPassword]);

  const strength = useMemo(() => {
    const score = [
      rules.hasMin8,
      rules.hasUpper,
      rules.hasLower,
      rules.hasDigit,
      rules.hasSpecial,
    ].filter(Boolean).length; // 0..5

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

  // ===== Handlers =====
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    if (!currentPassword) {
      setError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/account/verify-password", {
        currentPassword,
      });
      if (res?.data?.ok) {
        setStep("NEW");
        setSuccessMsg("");
      } else {
        setError("Mật khẩu hiện tại không đúng.");
      }
    } catch (err) {
      // Nếu backend chưa sẵn, bạn có thể tạm DEMO bằng cách coi mọi mật khẩu đều đúng:
      // setStep("NEW");
      // return;
      setError(err?.response?.data?.message || "Xác thực mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmNew) {
      setError("Vui lòng nhập đầy đủ mật khẩu mới.");
      return;
    }
    if (newPassword !== confirmNew) {
      setError("Hai mật khẩu mới không khớp.");
      return;
    }
    // Tối thiểu nên đạt 4/5 điều kiện
    const satisfied = Object.values(rules).filter(Boolean).length;
    if (satisfied < 4) {
      setError("Mật khẩu mới chưa đủ mạnh. Vui lòng cải thiện.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("Mật khẩu mới không được trùng mật khẩu hiện tại.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/account/change-password", {
        currentPassword, // nhiều backend vẫn yêu cầu gửi lại để an toàn
        newPassword,
      });
      if (res?.data?.ok) {
        setStep("DONE");
        setSuccessMsg("Bạn đã đổi mật khẩu thành công.");
        // Xoá dữ liệu nhạy cảm khỏi state
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNew("");
      } else {
        setError("Đổi mật khẩu thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Có lỗi khi đổi mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  // ====== Render helpers ======
  const StepHeader = () => (
    <div className="d-flex align-items-center justify-content-between mb-3">
      <h5 className="mb-0">Đổi mật khẩu</h5>
      <div className="text-muted small">
        {step === "VERIFY" && "Bước 1/3"}
        {step === "NEW" && "Bước 2/3"}
        {step === "DONE" && "Bước 3/3"}
      </div>
    </div>
  );

  const VerifyForm = () => (
    <Form onSubmit={handleVerify} className="text-start">
      <Form.Group className="mb-3" controlId="currentPassword">
        <Form.Label className="fw-semibold">Mật khẩu hiện tại</Form.Label>
        <InputGroup>
          <Form.Control
            type={showCurrent ? "text" : "password"}
            placeholder="Nhập mật khẩu hiện tại"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoFocus
            required
          />
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => setShowCurrent((s) => !s)}
            aria-label={showCurrent ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showCurrent ? "Ẩn" : "Hiện"}
          </Button>
        </InputGroup>
        <Form.Text className="text-muted">
          Vì lý do bảo mật, bạn cần xác nhận mật khẩu hiện tại trước khi đổi.
        </Form.Text>
      </Form.Group>

      <div className="d-flex gap-2">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Đang xác nhận...
            </>
          ) : (
            "Xác nhận"
          )}
        </Button>
      </div>
    </Form>
  );

  const NewPasswordForm = () => (
    <Form onSubmit={handleChangePassword} className="text-start">
      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="newPassword">
            <Form.Label className="fw-semibold">Mật khẩu mới</Form.Label>
            <InputGroup>
              <Form.Control
                type={showNew1 ? "text" : "password"}
                placeholder="Tối thiểu 8 ký tự, gồm chữ hoa, thường, số..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => setShowNew1((s) => !s)}
              >
                {showNew1 ? "Ẩn" : "Hiện"}
              </Button>
            </InputGroup>
            <div className="mt-2">
              <ProgressBar now={strength.percent} variant={strength.variant} />
              <div className="small text-muted mt-1">
                Độ mạnh: {strength.label}
              </div>
            </div>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="confirmNew">
            <Form.Label className="fw-semibold">
              Nhập lại mật khẩu mới
            </Form.Label>
            <InputGroup>
              <Form.Control
                type={showNew2 ? "text" : "password"}
                placeholder="Nhập lại để xác nhận"
                value={confirmNew}
                onChange={(e) => setConfirmNew(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => setShowNew2((s) => !s)}
              >
                {showNew2 ? "Ẩn" : "Hiện"}
              </Button>
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>

      {/* Checklist yêu cầu */}
      <div className="mt-3 p-2 border rounded bg-light">
        <div className="fw-semibold mb-2">Mật khẩu nên có:</div>
        <ul className="mb-0 small">
          <li className={rules.hasMin8 ? "text-success" : ""}>
            Tối thiểu 8 ký tự
          </li>
          <li className={rules.hasUpper ? "text-success" : ""}>
            Ít nhất 1 chữ hoa (A Z)
          </li>
          <li className={rules.hasLower ? "text-success" : ""}>
            Ít nhất 1 chữ thường (a z)
          </li>
          <li className={rules.hasDigit ? "text-success" : ""}>
            Ít nhất 1 chữ số (0 9)
          </li>
          <li className={rules.hasSpecial ? "text-success" : ""}>
            Ít nhất 1 ký tự đặc biệt (@ # $ % ...)
          </li>
        </ul>
      </div>

      <div className="d-flex gap-2 mt-3">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Đang đổi mật khẩu...
            </>
          ) : (
            "Đổi mật khẩu"
          )}
        </Button>
        <Button
          type="button"
          variant="outline-secondary"
          onClick={() => setStep("VERIFY")}
          disabled={loading}
        >
          Quay lại
        </Button>
      </div>
    </Form>
  );

  const DoneView = () => (
    <div className="text-center py-4">
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success text-white mb-3"
        style={{ width: 72, height: 72, fontSize: 36 }}
      >
        ✓
      </div>
      <h5 className="mb-2">Đổi mật khẩu thành công</h5>
      <p className="text-muted">
        Bạn có thể sử dụng mật khẩu mới cho lần đăng nhập tiếp theo.
      </p>
      <div className="d-flex gap-2 justify-content-center">
        <Button variant="primary" onClick={() => setStep("VERIFY")}>
          Đổi tiếp
        </Button>
        <Button
          variant="outline-secondary"
          onClick={() => window.history.back()}
        >
          Quay lại
        </Button>
      </div>
    </div>
  );

  return (
    <div className="account-page">
      <StepHeader />

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      {successMsg && step !== "DONE" && (
        <Alert variant="success" className="mb-3">
          {successMsg}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          {step === "VERIFY" && <VerifyForm />}
          {step === "NEW" && <NewPasswordForm />}
          {step === "DONE" && <DoneView />}
        </Card.Body>
      </Card>
    </div>
  );
}
