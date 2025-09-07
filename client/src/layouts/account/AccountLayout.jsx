// src/pages/Account/AccountLayout.jsx
import { Container, Row, Col, Card } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import AccountSidebar from "../../components/account/AccountSidebar.jsx";
import "../../styles/AccountLayout.css";

export default function AccountLayout() {
  return (
    <Container fluid className="account-layout">
      <Row className="g-4 align-items-stretch">
        <Col className="account-sidebar-col account-shell">
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
