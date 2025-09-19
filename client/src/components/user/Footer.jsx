import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      className="site-footer"
      style={{
        background: "linear-gradient(180deg, #2e4a86ff, #142039ff)",
        color: "#e2e8f0",
      }}
    >
      {/* Local styles for hover, spacing, etc. */}
      <style>{`
        .site-footer h6 { color:#00a8ff; letter-spacing:.3px; margin-bottom:10px; font-weight:700 }
        .site-footer ul { list-style:none; padding:0; margin:0 }
        .site-footer li { margin:6px 0; opacity:.9 }
        .site-footer a { color:#cbd5e1; text-decoration:none }
        .site-footer a:hover { color:#ffffff; text-decoration:underline }
        .site-footer .pill {
          display:inline-block; padding:6px 10px; border:1px solid rgba(50, 95, 168, 1); border-radius:999px; font-size:.85rem; color:#9fb3c8
        }
        .site-footer .muted { color:#9fb3c8 }
        .site-footer .divider { border-top:1px solid rgba(50, 95, 168, 1) }
      `}</style>

      <Container style={{ padding: "28px 0 10px" }}>
        {/* Main link sections */}
        <Row className="align-items-start gy-4">
          <Col md={3} sm={6} xs={12}>
            <h6>PC lắp sẵn</h6>
            <ul>
              <li>
                <a href="#">Đồ họa / Workstation</a>
              </li>
              <li>
                <a href="#">AIO (All-in-One)</a>
              </li>
              <li>
                <a href="#">Văn phòng</a>
              </li>
              <li>
                <a href="#">Gaming</a>
              </li>
              <li>
                <a href="#">Mini PC</a>
              </li>
            </ul>
          </Col>

          <Col md={3} sm={6} xs={12}>
            <h6>Laptop</h6>
            <ul>
              <li>
                <a href="#">Học sinh – sinh viên</a>
              </li>
              <li>
                <a href="#">Đồ họa / Creator</a>
              </li>
              <li>
                <a href="#">Doanh nhân</a>
              </li>
              <li>
                <a href="#">Mỏng nhẹ</a>
              </li>
              <li>
                <a href="#">Gaming</a>
              </li>
            </ul>
          </Col>

          <Col md={3} sm={6} xs={12}>
            <h6>Linh kiện PC</h6>
            <ul>
              <li>
                <a href="#">Card đồ họa</a>
              </li>
              <li>
                <a href="#">Tản nhiệt</a>
              </li>
              <li>
                <a href="#">Vỏ Case</a>
              </li>
              <li>
                <a href="#">RAM</a>
              </li>
              <li>
                <a href="#">Lưu trữ (SSD/HDD)</a>
              </li>
            </ul>
          </Col>

          <Col md={3} sm={6} xs={12}>
            <h6>Dịch vụ</h6>
            <ul>
              <li>
                <a href="#">Build PC theo yêu cầu</a>
              </li>
              <li>
                <a href="#">Sao lưu &amp; cứu dữ liệu</a>
              </li>
              <li>
                <a href="#">Cài đặt OS/Driver</a>
              </li>
              <li>
                <a href="#">Vệ sinh / tra keo</a>
              </li>
            </ul>
          </Col>
        </Row>

        {/* Divider */}
        <div className="divider mt-4 mb-3" />

        {/* Bottom bar: copyright + credit */}
        <Row className="align-items-center gy-2" style={{ fontSize: ".9rem" }}>
          <Col md={6} xs={12} className="muted">
            © {year} Computer &amp; Components Store. Built with React + Node.js
            + Express.js
          </Col>
          <Col md={6} xs={12} className="text-md-end">
            <span className="muted">Được tạo bởi </span>
            <strong>Danh Nguyễn Nhựt An</strong>
            <span className="muted"> • </span>
            <strong>Lê Công Tuấn</strong>
            <span className="muted"> • </span>
            <strong>Võ Thị Thanh Ngân</strong>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
