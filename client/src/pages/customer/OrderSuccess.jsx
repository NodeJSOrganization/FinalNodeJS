import { useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useLocation, useNavigate, Link } from "react-router-dom";

import { BsCheckCircleFill } from "react-icons/bs";

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const orderId = location.state?.orderId;

  useEffect(() => {
    if (!orderId) {
      console.log("Không tìm thấy mã đơn hàng, đang điều hướng về trang chủ.");
      navigate("/");
    }
  }, [orderId, navigate]);

  if (!orderId) {
    return null;
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="text-center shadow-sm border-0">
            <Card.Body className="p-4 p-md-5">
              <BsCheckCircleFill size={80} className="text-success mb-4" />

              <Card.Title as="h2" className="mb-3">
                Đặt hàng thành công!
              </Card.Title>

              <p className="text-muted mb-4">
                Cảm ơn bạn đã tin tưởng và mua sắm. Đơn hàng của bạn đã được hệ
                thống ghi nhận và sẽ sớm được xử lý.
              </p>

              <div className="bg-light p-3 rounded mb-4 border">
                Mã đơn hàng của bạn là:
                <h4 className="mt-2 text-primary fw-bold letter-spacing-1">
                  {orderId}
                </h4>
              </div>

              <p>
                Bạn có thể theo dõi trạng thái đơn hàng trong mục "Lịch sử mua
                hàng".
              </p>

              <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mt-4 pt-2">
                <Button as={Link} to="/" variant="primary" size="lg">
                  Tiếp tục mua sắm
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
