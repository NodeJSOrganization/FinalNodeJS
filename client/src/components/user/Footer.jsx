import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "#666666",
        color: "#fff",
        padding: "6px 0",
        fontSize: "0.7em",
      }}
    >
      <Container>
        <Row className="align-items-start">
          <Col md={3} sm={6} xs={12} className="mb-3">
            <Row>
              <Col xs={4}>
                <h6 style={{ color: "#00a8ff" }}>PC lắp sẵn:</h6>
              </Col>
              <Col xs={8}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  <li>Đồ họa/Workstation</li>
                  <li>AIO (All-in-One)</li>
                  <li>Văn phòng</li>
                  <li>Gaming</li>
                  <li>Mini PC</li>
                </ul>
              </Col>
            </Row>
          </Col>

          <Col md={3} sm={6} xs={12} className="mb-3">
            <Row>
              <Col>
                <h6 style={{ color: "#00a8ff" }}>Laptop: Học sinh-sinh viên</h6>
              </Col>
              <Col>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  <li>Đồ họa/Creator</li>
                  <li>Doanh nhân</li>
                  <li>Mỏng nhẹ</li>
                  <li>Văn phòng</li>
                  <li>Gaming</li>
                </ul>
              </Col>
            </Row>
          </Col>

          <Col md={3} sm={6} xs={12} className="mb-3">
            <Row>
              <Col>
                <h6 style={{ color: "#00a8ff" }}>
                  Linh kiện PC: Lưu trữ trong
                </h6>
              </Col>
              <Col>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  <li>Card đồ họa</li>
                  <li>Tản nhiệt</li>
                  <li>Vỏ Case</li>
                  <li>RAM</li>
                </ul>
              </Col>
            </Row>
          </Col>

          <Col md={3} sm={6} xs={12} className="mb-3">
            <Row>
              <Col>
                <h6 style={{ color: "#00a8ff" }}>
                  Dịch vụ: Build PC theo yêu cầu
                </h6>
              </Col>
              <Col>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  <li>Sao lưu & cứu dữ liệu</li>
                  <li>Cài đặt OS/driver</li>
                  <li>Vệ sinh/tra keo</li>
                </ul>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
