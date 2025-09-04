import { Container, Row, Col, Card } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import AccountSidebar from "../../components/account/AccountSidebar.jsx";

export default function AccountLayout() {
  return (
    <Container fluid className="py-4">
      <Row className="g-4">
        <Col lg={3} md={4} xs={12}>
          <AccountSidebar />
        </Col>
        <Col lg={9} md={8} xs={12}>
          <Card className="shadow-sm">
            <Card.Body>
              {/* Nội dung sẽ thay đổi theo item sidebar */}
              <Outlet />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
