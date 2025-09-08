// client/src/pages/AccountOrderHistory.jsx
import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Image,
  InputGroup,
  ListGroup,
  Nav,
  Row,
  Collapse,
} from "react-bootstrap";
import "../../../styles/AccountOrderHistory.css";

const STATUS = {
  ALL: "ALL",
  PENDING: "PENDING", // Chờ xác nhận
  READY: "READY", // Chờ lấy hàng
  SHIPPING: "SHIPPING", // Chờ giao hàng
  COMPLETED: "COMPLETED", // Hoàn thành
  CANCELED: "CANCELED", // Đã hủy
};

const STATUS_LABEL = {
  [STATUS.PENDING]: "Chờ xác nhận",
  [STATUS.READY]: "Chờ lấy hàng",
  [STATUS.SHIPPING]: "Chờ giao hàng",
  [STATUS.COMPLETED]: "Hoàn thành",
  [STATUS.CANCELED]: "Đã hủy",
};

const STATUS_BADGE = {
  [STATUS.PENDING]: "warning",
  [STATUS.READY]: "info",
  [STATUS.SHIPPING]: "primary",
  [STATUS.COMPLETED]: "success",
  [STATUS.CANCELED]: "danger",
};

const currency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Math.max(0, Number(v) || 0)
  );

const formatDateTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN");
};

// 1 điểm = 1.000đ (theo mô tả Loyalty trong yêu cầu)
const POINT_VALUE = 1000;

// ===== Demo data mở rộng để hiển thị ngay giao diện =====
const DEMO_ORDERS = [
  {
    orderId: "DH230901",
    status: STATUS.COMPLETED,
    createdAt: "2025-09-01T08:30:00",
    paymentMethod: "COD",
    shippingFee: 30000,
    couponCode: "SAVE10",
    couponDiscount: 50000, // số tiền giảm từ mã
    pointsUsed: 20, // điểm đã dùng
    recipient: {
      name: "Nguyễn Văn A",
      phone: "0901234567",
      address: "12/3 Đường Trần Phú, P.4, Q.5, TP.HCM",
    },
    items: [
      {
        productId: "P001",
        name: "14 inch Acer Swift SF114-32 SF314-14 / 52 / 54 / 55 / 56 SF514-51 Vỏ bàn phím",
        variant: "Phím bảo vệ silicon | Màu đen",
        qty: 1,
        priceOriginal: 516890,
        discount: 0.1,
        image: "../../../public/images/products/product_test.png",
      },
    ],
  },
  {
    orderId: "DH230902",
    status: STATUS.PENDING,
    createdAt: "2025-09-02T10:05:00",
    paymentMethod: "VNPAY",
    shippingFee: 30000,
    couponCode: null,
    couponDiscount: 0,
    pointsUsed: 0,
    recipient: {
      name: "Trần Thị B",
      phone: "0909999999",
      address: "99 Nguyễn Huệ, Q.1, TP.HCM",
    },
    items: [
      {
        productId: "P002",
        name: "Chuột không dây Logitech M331 Silent",
        variant: "Màu: Đen",
        qty: 1,
        priceOriginal: 299000,
        discount: 0.2,
        image: "../../../public/images/products/product_test.png",
      },
    ],
  },
  {
    orderId: "DH230903",
    status: STATUS.READY,
    createdAt: "2025-09-03T14:22:00",
    paymentMethod: "COD",
    shippingFee: 30000,
    couponCode: "PHUKIEN15",
    couponDiscount: 45000,
    pointsUsed: 10,
    recipient: {
      name: "Lê Công C",
      phone: "0911111111",
      address: "01 Lý Thường Kiệt, Q.10, TP.HCM",
    },
    items: [
      {
        productId: "P003",
        name: "Bàn phím cơ Keychron K6",
        variant: "Brown Switch | Led trắng",
        qty: 1,
        priceOriginal: 1899000,
        discount: 0.1,
        image: "../../../public/images/products/product_test.png",
      },
      {
        productId: "P004",
        name: "Lót chuột DareU",
        variant: "Size L",
        qty: 2,
        priceOriginal: 129000,
        discount: 0.2,
        image: "../../../public/images/products/product_test.png",
      },
    ],
  },
  {
    orderId: "DH230904",
    status: STATUS.SHIPPING,
    createdAt: "2025-09-04T09:00:00",
    paymentMethod: "COD",
    shippingFee: 30000,
    couponCode: null,
    couponDiscount: 0,
    pointsUsed: 0,
    recipient: {
      name: "Phạm D",
      phone: "0933333333",
      address: "Khu Phú Mỹ Hưng, Q.7, TP.HCM",
    },
    items: [
      {
        productId: "P005",
        name: "SSD Samsung 980 1TB NVMe",
        variant: "M.2 PCIe 3.0",
        qty: 1,
        priceOriginal: 1699000,
        discount: 0.1,
        image: "../../../public/images/products/product_test.png",
      },
    ],
  },
  {
    orderId: "DH230905",
    status: STATUS.CANCELED,
    createdAt: "2025-09-05T19:45:00",
    paymentMethod: "VNPAY",
    shippingFee: 0,
    couponCode: null,
    couponDiscount: 0,
    pointsUsed: 0,
    recipient: {
      name: "Đỗ E",
      phone: "0988888888",
      address: "TT. Nhà Bè, TP.HCM",
    },
    items: [
      {
        productId: "P006",
        name: "Tản nhiệt CPU Deepcool AK400",
        variant: "Đen",
        qty: 1,
        priceOriginal: 649000,
        discount: 0.2,
        image: "../../../public/images/products/product_test.png",
      },
    ],
  },
];

const priceAfterDiscount = (it) =>
  (Number(it.priceOriginal) || 0) * (1 - (Number(it.discount) || 0));

const calcSubtotal = (order) =>
  order.items.reduce(
    (sum, it) => sum + priceAfterDiscount(it) * Number(it.qty || 0),
    0
  );

const calcPayable = (order) => {
  const subtotal = calcSubtotal(order);
  const shipping = Number(order.shippingFee || 0);
  const coupon = Number(order.couponDiscount || 0);
  const pointsValue = Number(order.pointsUsed || 0) * POINT_VALUE;
  return Math.max(0, subtotal + shipping - coupon - pointsValue);
};

export default function AccountOrderHistory() {
  const [activeTab, setActiveTab] = useState(STATUS.ALL);
  const [keyword, setKeyword] = useState("");
  const [expandedId, setExpandedId] = useState(null); // đơn hàng đang mở chi tiết

  const orders = DEMO_ORDERS; // TODO: thay bằng data từ API của bạn

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return orders
      .filter((o) => (activeTab === STATUS.ALL ? true : o.status === activeTab))
      .filter((o) => {
        if (!kw) return true;
        const inOrderId = o.orderId.toLowerCase().includes(kw);
        const inItems = o.items.some((it) =>
          it.name.toLowerCase().includes(kw)
        );
        return inOrderId || inItems;
      });
  }, [orders, activeTab, keyword]);

  // ====== Action handlers (tùy bạn gắn API) ======
  const handleCancel = (order) => {
    console.log("Cancel order:", order.orderId);
    alert(`Yêu cầu hủy đơn ${order.orderId} đã được gửi`);
  };

  const handleReorder = (order) => {
    console.log("Reorder:", order.orderId);
    alert(`Đã thêm sản phẩm trong đơn ${order.orderId} vào giỏ`);
  };

  const handleReview = (order) => {
    console.log("Review order:", order.orderId);
    alert(`Đi đến trang đánh giá cho đơn ${order.orderId}`);
  };

  const toggleExpanded = (orderId) => {
    setExpandedId((cur) => (cur === orderId ? null : orderId));
  };

  return (
    <Container className="py-4">
      {/* Tabs trạng thái */}
      <Nav
        variant="tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3 flex-nowrap flex-wrap"
      >
        <Nav.Item>
          <Nav.Link className="text-dark" eventKey={STATUS.ALL}>
            Tất cả
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link className="text-dark" eventKey={STATUS.PENDING}>
            Chờ xác nhận
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link className="text-dark" eventKey={STATUS.READY}>
            Chờ lấy hàng
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link className="text-dark" eventKey={STATUS.SHIPPING}>
            Chờ giao hàng
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link className="text-dark" eventKey={STATUS.COMPLETED}>
            Hoàn thành
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link className="text-dark" eventKey={STATUS.CANCELED}>
            Đã hủy
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Thanh tìm kiếm */}
      <InputGroup className="mb-4">
        <Form.Control
          placeholder="Bạn có thể tìm kiếm theo ID đơn hàng hoặc Tên Sản phẩm"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button variant="outline-secondary" onClick={() => setKeyword(keyword)}>
          Tìm
        </Button>
        {keyword && (
          <Button variant="outline-secondary" onClick={() => setKeyword("")}>
            Xóa
          </Button>
        )}
      </InputGroup>

      {/* Danh sách đơn hàng */}
      <div className="d-flex flex-column gap-3">
        {filtered.map((order) => {
          const subtotal = calcSubtotal(order);
          const totalPayable = calcPayable(order);
          const isOpen = expandedId === order.orderId;

          return (
            <Card key={order.orderId} className="shadow-sm">
              {/* Header - bấm để mở/đóng chi tiết */}
              <Card.Header
                onClick={() => toggleExpanded(order.orderId)}
                role="button"
                className="d-flex align-items-center justify-content-between"
                style={{ cursor: "pointer" }}
                aria-controls={`order-detail-${order.orderId}`}
                aria-expanded={isOpen}
                title="Bấm để xem/ẩn chi tiết đơn hàng"
              >
                <div className="d-flex align-items-center gap-3">
                  <span className="text-muted">Mã đơn: {order.orderId}</span>
                  <span className="text-muted small">
                    • Lập lúc: {formatDateTime(order.createdAt)}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Badge bg={STATUS_BADGE[order.status]}>
                    {STATUS_LABEL[order.status]}
                  </Badge>
                  <i
                    className={`bi ${
                      isOpen ? "bi-chevron-up" : "bi-chevron-down"
                    }`}
                  />
                </div>
              </Card.Header>

              {/* TÓM TẮT sản phẩm (như trước) */}
              <Card.Body className="pt-3 pb-0">
                <ListGroup variant="flush">
                  {order.items.map((it) => (
                    <ListGroup.Item key={it.productId} className="px-0">
                      <Row className="g-3 align-items-center">
                        <Col xs={3} md={2}>
                          <div className="border rounded p-1 bg-light">
                            <Image src={it.image} alt={it.name} fluid rounded />
                          </div>
                        </Col>
                        <Col xs={9} md={7}>
                          <div className="fw-semibold text-start">
                            {it.name}
                          </div>
                          <div className="text-muted small text-start">
                            Phân loại hàng: {it.variant}
                          </div>
                          <div className="text-muted small text-start">
                            x{it.qty}
                          </div>
                          {order.status === STATUS.COMPLETED && (
                            <div className="text-success small mt-1 text-start fw-semibold">
                              <i className="bi bi-truck"></i> Giao hàng thành
                              công
                            </div>
                          )}
                          {order.status === STATUS.SHIPPING && (
                            <div className="text-success small mt-1 text-start fw-semibold">
                              <i className="bi bi-truck"></i> Đang giao hàng
                            </div>
                          )}
                        </Col>
                        <Col xs={12} md={3} className="text-md-end">
                          <div className="text-decoration-line-through text-muted small">
                            {currency(it.priceOriginal)}
                          </div>
                          <div className="text-muted small">
                            <span className="text-danger fw-medium">
                              {currency(priceAfterDiscount(it))}
                            </span>
                          </div>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>

              {/* FOOTER tóm tắt tiền */}
              <Card.Footer className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-3">
                <div className="ms-md-auto me-md-3">
                  <span className="me-2">Tạm tính:</span>
                  <span className="fw-semibold">{currency(subtotal)}</span>
                  <span className="text-muted mx-2">•</span>
                  <span className="me-2">Thành tiền:</span>
                  <span className="fs-5 fw-semibold text-danger">
                    {currency(totalPayable)}
                  </span>
                </div>

                <div className="d-flex gap-2 justify-content-end">
                  {order.status === STATUS.PENDING && (
                    <Button
                      variant="outline-dark"
                      onClick={() => handleCancel(order)}
                    >
                      <span className="small">Hủy đơn hàng</span>
                    </Button>
                  )}

                  {order.status === STATUS.CANCELED && (
                    <Button
                      variant="danger"
                      onClick={() => handleReorder(order)}
                    >
                      <span className="small">Mua lại</span>
                    </Button>
                  )}

                  {order.status === STATUS.COMPLETED && (
                    <>
                      <Button
                        variant="danger"
                        onClick={() => handleReorder(order)}
                      >
                        <span className="small">Mua lại</span>
                      </Button>
                      <Button
                        variant="outline-dark"
                        onClick={() => handleReview(order)}
                      >
                        <span className="small">Đánh giá sản phẩm</span>
                      </Button>
                    </>
                  )}
                </div>
              </Card.Footer>

              {/* Ô CHI TIẾT - bung khi click header */}
              <Collapse in={isOpen}>
                <div
                  id={`order-detail-${order.orderId}`}
                  className="border-top"
                >
                  <Card.Body>
                    <Row className="g-4">
                      {/* Cột thông tin đơn */}
                      <Col lg={5}>
                        <div className="mb-3">
                          <div className="fw-semibold mb-2">
                            Thông tin đơn hàng
                          </div>
                          <ListGroup variant="flush" className="small">
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                              <span>Mã đơn</span>
                              <span className="fw-semibold">
                                {order.orderId}
                              </span>
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                              <span>Trạng thái</span>
                              <span>
                                <Badge bg={STATUS_BADGE[order.status]}>
                                  {STATUS_LABEL[order.status]}
                                </Badge>
                              </span>
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                              <span>Thời gian lập</span>
                              <span className="fw-semibold">
                                {formatDateTime(order.createdAt)}
                              </span>
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                              <span>Phương thức thanh toán</span>
                              <span className="fw-semibold">
                                {order.paymentMethod}
                              </span>
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                              <span>Phí vận chuyển</span>
                              <span className="fw-semibold">
                                {currency(order.shippingFee)}
                              </span>
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                              <span>Mã giảm giá (đã dùng)</span>
                              <span className="fw-semibold">
                                {order.couponCode || "—"}{" "}
                                {order.couponDiscount
                                  ? `(-${currency(order.couponDiscount)})`
                                  : ""}
                              </span>
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                              <span>Điểm thưởng (đã dùng)</span>
                              <span className="fw-semibold">
                                {order.pointsUsed || 0} điểm{" "}
                                {order.pointsUsed
                                  ? `(-${currency(
                                      order.pointsUsed * POINT_VALUE
                                    )})`
                                  : ""}
                              </span>
                            </ListGroup.Item>
                          </ListGroup>
                        </div>

                        <div>
                          <div className="fw-semibold mb-2">Người nhận</div>
                          <ListGroup variant="flush" className="small">
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                              <span>Họ tên</span>
                              <span className="fw-semibold">
                                {order.recipient?.name}
                              </span>
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                              <span>Số điện thoại</span>
                              <span className="fw-semibold">
                                {order.recipient?.phone}
                              </span>
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0">
                              <div className="mb-1">Địa chỉ</div>
                              <div className="fw-semibold">
                                {order.recipient?.address}
                              </div>
                            </ListGroup.Item>
                          </ListGroup>
                        </div>
                      </Col>

                      {/* Cột danh sách sản phẩm chi tiết */}
                      <Col lg={7}>
                        <div className="fw-semibold mb-2">
                          Sản phẩm trong đơn
                        </div>
                        <ListGroup variant="flush">
                          {order.items.map((it) => {
                            const finalPrice = priceAfterDiscount(it);
                            const lineTotal = finalPrice * Number(it.qty || 0);
                            return (
                              <ListGroup.Item
                                key={`detail-${it.productId}`}
                                className="px-0 py-3"
                              >
                                <Row className="g-3 align-items-center">
                                  <Col xs={3} md={2}>
                                    <div className="border rounded p-1 bg-light">
                                      <Image
                                        src={it.image}
                                        alt={it.name}
                                        fluid
                                        rounded
                                      />
                                    </div>
                                  </Col>
                                  <Col xs={9} md={6}>
                                    <div className="fw-semibold">{it.name}</div>
                                    <div className="text-muted small">
                                      Phân loại: {it.variant}
                                    </div>
                                    <div className="text-muted small">
                                      SL: x{it.qty}
                                    </div>
                                  </Col>
                                  <Col xs={12} md={4} className="text-md-end">
                                    <div className="text-decoration-line-through text-muted small">
                                      {currency(it.priceOriginal)}
                                    </div>
                                    <div className="small">
                                      Đơn giá:{" "}
                                      <span className="fw-semibold">
                                        {currency(finalPrice)}
                                      </span>
                                    </div>
                                    <div className="small">
                                      Thành tiền:{" "}
                                      <span className="fw-semibold text-danger">
                                        {currency(lineTotal)}
                                      </span>
                                    </div>
                                  </Col>
                                </Row>
                              </ListGroup.Item>
                            );
                          })}
                        </ListGroup>

                        {/* Tổng kết chi tiết */}
                        <div className="mt-3 border-top pt-3">
                          <Row className="small">
                            <Col className="text-muted">Tạm tính</Col>
                            <Col className="text-end fw-semibold">
                              {currency(subtotal)}
                            </Col>
                          </Row>
                          <Row className="small">
                            <Col className="text-muted">Phí vận chuyển</Col>
                            <Col className="text-end fw-semibold">
                              {currency(order.shippingFee)}
                            </Col>
                          </Row>
                          <Row className="small">
                            <Col className="text-muted">Giảm giá từ mã</Col>
                            <Col className="text-end fw-semibold text-success">
                              -{currency(order.couponDiscount || 0)}
                            </Col>
                          </Row>
                          <Row className="small">
                            <Col className="text-muted">
                              Giảm từ điểm thưởng
                            </Col>
                            <Col className="text-end fw-semibold text-success">
                              -{currency((order.pointsUsed || 0) * POINT_VALUE)}
                            </Col>
                          </Row>
                          <Row className="mt-2">
                            <Col className="fw-semibold">Tổng thanh toán</Col>
                            <Col className="text-end fs-5 fw-semibold text-danger">
                              {currency(totalPayable)}
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </div>
              </Collapse>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center text-muted py-5">
            Không tìm thấy đơn hàng phù hợp
          </div>
        )}
      </div>
    </Container>
  );
}
