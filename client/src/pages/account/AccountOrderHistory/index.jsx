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
    v || 0
  );

// ===== Demo data để bạn xem ngay giao diện =====
const DEMO_ORDERS = [
  // {
  //   orderId: "DH230901",
  //   status: STATUS.COMPLETED,
  //   items: [
  //     {
  //       productId: "P001",
  //       name: "14 inch Acer Swift SF114-32 SF314-14 / 52 / 54 / 55 / 56 SF514-51 Vỏ bàn phím",
  //       variant: "Phím bảo vệ silicon | Màu đen",
  //       qty: 1,
  //       priceOriginal: 516890,
  //       discount: 0.1,
  //       image: "../../../public/images/products/product_test.png",
  //     },
  //   ],
  // },
  // {
  //   orderId: "DH230902",
  //   status: STATUS.PENDING,
  //   items: [
  //     {
  //       productId: "P002",
  //       name: "Chuột không dây Logitech M331 Silent",
  //       variant: "Màu: Đen",
  //       qty: 1,
  //       priceOriginal: 299000,
  //       discount: 0.2,
  //       image: "../../../public/images/products/product_test.png",
  //     },
  //   ],
  // },
  // {
  //   orderId: "DH230903",
  //   status: STATUS.READY,
  //   items: [
  //     {
  //       productId: "P003",
  //       name: "Bàn phím cơ Keychron K6",
  //       variant: "Brown Switch | Led trắng",
  //       qty: 1,
  //       priceOriginal: 1899000,
  //       discount: 0.1,
  //       image: "../../../public/images/products/product_test.png",
  //     },
  //     {
  //       productId: "P004",
  //       name: "Lót chuột DareU",
  //       variant: "Size L",
  //       qty: 2,
  //       priceOriginal: 129000,
  //       discount: 0.2,
  //       image: "../../../public/images/products/product_test.png",
  //     },
  //   ],
  // },
  // {
  //   orderId: "DH230904",
  //   status: STATUS.SHIPPING,
  //   items: [
  //     {
  //       productId: "P005",
  //       name: "SSD Samsung 980 1TB NVMe",
  //       variant: "M.2 PCIe 3.0",
  //       qty: 1,
  //       priceOriginal: 1699000,
  //       discount: 0.1,
  //       image: "../../../public/images/products/product_test.png",
  //     },
  //   ],
  // },
  // {
  //   orderId: "DH230905",
  //   status: STATUS.CANCELED,
  //   items: [
  //     {
  //       productId: "P006",
  //       name: "Tản nhiệt CPU Deepcool AK400",
  //       variant: "Đen",
  //       qty: 1,
  //       priceOriginal: 649000,
  //       discount: 0.2,
  //       image: "../../../public/images/products/product_test.png",
  //     },
  //   ],
  // },
];

function calcOrderTotal(order) {
  return order.items.reduce(
    (sum, it) => sum + Number(it.priceOriginal || 0) * Number(it.qty || 0),
    0
  );
}

export default function AccountOrderHistory() {
  const [activeTab, setActiveTab] = useState(STATUS.ALL);
  const [keyword, setKeyword] = useState("");

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
    // Gọi API hủy: /api/orders/:id/cancel
    console.log("Cancel order:", order.orderId);
    alert(`Yêu cầu hủy đơn ${order.orderId} đã được gửi`);
  };

  const handleReorder = (order) => {
    // Gọi API mua lại
    console.log("Reorder:", order.orderId);
    alert(`Đã thêm sản phẩm trong đơn ${order.orderId} vào giỏ`);
  };

  const handleReview = (order) => {
    // Điều hướng đến trang đánh giá /account/reviews?orderId=...
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
      <div className="d-flex flex-column gap-3">
        {filtered.map((order) => {
          const total = calcOrderTotal(order);
          return (
            <Card key={order.orderId} className="shadow-sm">
              <Card.Header className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted">Mã đơn: {order.orderId}</span>
                </div>
                <Badge bg={STATUS_BADGE[order.status]}>
                  {STATUS_LABEL[order.status]}
                </Badge>
              </Card.Header>

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
                              <i class="bi bi-truck"></i> Giao hàng thành công
                            </div>
                          )}
                          {order.status === STATUS.SHIPPING && (
                            <div className="text-success small mt-1 text-start fw-semibold">
                              <i class="bi bi-truck"></i> Đang giao hàng
                            </div>
                          )}
                        </Col>
                        <Col xs={12} md={3} className="text-md-end">
                          <div className="text-decoration-line-through text-muted small">
                            {currency(it.priceOriginal)}
                          </div>
                          <div className="text-muted small">
                            <span className="text-danger fw-medium">
                              {currency(
                                it.priceOriginal -
                                  it.priceOriginal * it.discount
                              )}
                            </span>
                          </div>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>

              <Card.Footer className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-3">
                <div className="ms-md-auto me-md-3">
                  <span className="me-2">Thành tiền:</span>
                  <span className="fs-5 fw-semibold text-danger">
                    {currency(total)}
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

                  {(order.status === STATUS.READY ||
                    order.status === STATUS.SHIPPING) && (
                    // Không có nút riêng, chỉ hiển thị trạng thái theo yêu cầu
                    <></>
                  )}
                </div>
              </Card.Footer>
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
