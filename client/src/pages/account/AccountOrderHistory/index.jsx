// client/src/pages/AccountOrderHistory.jsx
import { useMemo, useState, useEffect } from "react";
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
import AccountOrderDetail from "../AccountOrderDetail/index.jsx";
import { getMyOrders } from "../../../api/orderApi.js";

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
  const [selectedOrder, setSelectedOrder] = useState(null); // đơn hàng đang thao tác (hủy, mua lại, đánh giá)
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getMyOrders();
        const json = res.data;

        if (!json.success) {
          throw new Error(json.message || "Không thể lấy danh sách đơn hàng");
        }

        setOrders(json.data || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
      {loading && (
        <div className="text-center text-muted py-5">
          Đang tải danh sách đơn hàng...
        </div>
      )}

      {!loading && error && (
        <div className="text-center text-danger py-5">{error}</div>
      )}

      {!loading && !error && (
        <div className="d-flex flex-column gap-3">
          {filtered.map((order) => {
            const subtotal = calcSubtotal(order);
            const totalPayable = calcPayable(order);

            return (
              <Card key={order.orderId} className="shadow-sm">
                {/* Header - bấm để mở/đóng chi tiết */}
                <Card.Header
                  onClick={() => setSelectedOrder(order)}
                  role="button"
                  className="d-flex align-items-center justify-content-between"
                  style={{ cursor: "pointer" }}
                  title="Bấm để xem chi tiết đơn hàng"
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
                              <Image
                                src={it.image}
                                alt={it.name}
                                fluid
                                rounded
                              />
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
              </Card>
            );
          })}

          <AccountOrderDetail
            order={selectedOrder}
            show={!!selectedOrder}
            onHide={() => setSelectedOrder(null)}
            subtotal={selectedOrder ? calcSubtotal(selectedOrder) : 0}
            totalPayable={selectedOrder ? calcPayable(selectedOrder) : 0}
          />

          {filtered.length === 0 && (
            <div className="text-center text-muted py-5">
              Không tìm thấy đơn hàng phù hợp
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
