// src/pages/Account/AccountLayout.jsx
import { Container, Row, Col, Card } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AccountSidebar from "../../components/account/AccountSidebar.jsx";
import "../../styles/AccountLayout.css";

import { getMe } from "../../api/accountApi.js"; // <-- bạn đã tạo ở accountApi
import { logout, updateUserInState } from "../../../features/auth/authSlice.js"; // đường dẫn chỉnh theo cấu trúc của bạn

export default function AccountLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Lấy user & token từ Redux authSlice
  const { user, token } = useSelector((state) => state.auth);

  // State local cho layout
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Nếu không có token -> chưa đăng nhập -> đá về /login
    if (!token) {
      navigate("/login?redirect=/account", { replace: true });
      return;
    }

    // 2. Nếu đã có user trong Redux rồi (do login hoặc đang trong session) -> không cần gọi /me nữa
    if (user) return;

    // 3. Nếu có token nhưng user null (VD: F5 reload) -> gọi /me
    const fetchMe = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getMe();
        const fetchedUser = res.data.data;

        // Đẩy user vào Redux + localStorage
        dispatch(updateUserInState(fetchedUser));
      } catch (err) {
        // Nếu token hết hạn / sai -> logout + về login
        if (err?.response?.status === 401) {
          dispatch(logout());
          navigate("/login?redirect=/account", { replace: true });
        } else {
          setError(
            err?.response?.data?.msg ||
              err?.response?.data?.message ||
              "Không tải được thông tin tài khoản."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token, user, dispatch, navigate]);

  // 4. Đang tải user -> hiển thị loading trong layout
  if (loading) {
    return (
      <Container
        fluid
        className="account-layout d-flex justify-content-center align-items-center"
      >
        <div>Đang tải tài khoản...</div>
      </Container>
    );
  }

  // 5. Lỗi (nhưng không phải 401) -> hiển thị thông báo
  if (error) {
    return (
      <Container
        fluid
        className="account-layout d-flex justify-content-center align-items-center"
      >
        <div className="text-danger">{error}</div>
      </Container>
    );
  }

  // 6. Bình thường -> render layout + Outlet
  return (
    <Container fluid className="account-layout">
      <Row className="g-4">
        <Col className="account-sidebar-col p-0">
          {/* Sidebar bám dính */}
          <AccountSidebar sticky />
        </Col>

        <Col className="account-main-col">
          <Card className="shadow-sm account-main-card">
            <Card.Body className="d-flex flex-column">
              <Outlet />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
