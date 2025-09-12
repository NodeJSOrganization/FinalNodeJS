import {
  Badge,
  Card,
  Col,
  Image,
  ListGroup,
  Row,
  Modal,
} from "react-bootstrap";

const POINT_VALUE = 1000;

const currency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Math.max(0, Number(v) || 0)
  );

const priceAfterDiscount = (it) =>
  (Number(it.priceOriginal) || 0) * (1 - (Number(it.discount) || 0));

const STATUS_BADGE = {
  PENDING: "warning",
  READY: "info",
  SHIPPING: "primary",
  COMPLETED: "success",
  CANCELED: "danger",
};

const STATUS_LABEL = {
  PENDING: "Chờ xác nhận",
  READY: "Chờ lấy hàng",
  SHIPPING: "Chờ giao hàng",
  COMPLETED: "Hoàn thành",
  CANCELED: "Đã hủy",
};

const formatDateTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN");
};

export default function AccountOrderDetail({
  order,
  show,
  onHide,
  subtotal,
  totalPayable,
}) {
  if (!order) return null;
  return (
    // Bỏ "scrollable" để tránh scroll tổng ở modal
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Chi tiết đơn hàng{" "}
          <span className="text-primary">{order.orderId}</span>
        </Modal.Title>
      </Modal.Header>

      {/* Ẩn scroll của Modal.Body để chỉ cột phải có scroll */}
      <Modal.Body style={{ overflowY: "hidden" }}>
        <Row className="g-4">
          {/* Cột thông tin đơn - KHÔNG SCROLL */}
          <Col lg={5}>
            <div className="mb-3">
              <div className="fw-semibold mb-2">Thông tin đơn hàng</div>
              <ListGroup variant="flush" className="small">
                <ListGroup.Item className="px-0 d-flex justify-content-between">
                  <span>Mã đơn</span>
                  <span className="fw-semibold">{order.orderId}</span>
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
                  <span className="fw-semibold">{order.paymentMethod}</span>
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
                      ? `(-${currency(order.pointsUsed * POINT_VALUE)})`
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
                  <span className="fw-semibold">{order.recipient?.name}</span>
                </ListGroup.Item>
                <ListGroup.Item className="px-0 d-flex justify-content-between">
                  <span>Số điện thoại</span>
                  <span className="fw-semibold">{order.recipient?.phone}</span>
                </ListGroup.Item>
                <ListGroup.Item className="px-0 d-flex justify-content-between">
                  <span className="mb-1">Địa chỉ</span>
                  <span className="fw-semibold">
                    {order.recipient?.address}
                  </span>
                </ListGroup.Item>
              </ListGroup>
            </div>
          </Col>

          {/* Cột danh sách sản phẩm chi tiết - CÓ SCROLL */}
          {/* Giới hạn chiều cao theo viewport và bật overflow */}
          <Col
            lg={7}
            style={{
              maxHeight: "70vh", // có thể chỉnh 60-75vh tùy UI
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: "0.25rem", // chừa khoảng cho thanh scroll
            }}
          >
            <div className="fw-semibold mb-2">Sản phẩm trong đơn</div>

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
                          <Image src={it.image} alt={it.name} fluid rounded />
                        </div>
                      </Col>
                      <Col xs={9} md={6}>
                        <div className="fw-semibold text-start">{it.name}</div>
                        <div className="text-muted small text-start">
                          Phân loại: {it.variant}
                        </div>
                        <div className="text-muted small text-start">
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
            <div className="mt-3 border-top pt-3 text-start">
              <Row className="small">
                <Col className="text-muted">Tạm tính</Col>
                <Col className="text-end fw-semibold">{currency(subtotal)}</Col>
              </Row>
              <Row className="small">
                <Col className="text-muted">Phí vận chuyển</Col>
                <Col className="text-end fw-semibold">
                  {currency(order.shippingFee)}
                </Col>
              </Row>
              <Row className="small">
                <Col className="text-muted">Giảm giá từ mã</Col>
                <Col className="text-end fw-semibold text-danger">
                  -{currency(order.couponDiscount || 0)}
                </Col>
              </Row>
              <Row className="small">
                <Col className="text-muted">Giảm từ điểm thưởng</Col>
                <Col className="text-end fw-semibold text-danger">
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
      </Modal.Body>
    </Modal>
  );
}
