import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  ListGroup,
  Image,
  Spinner,
} from "react-bootstrap";

// Import các actions/thunks cần thiết
import { createOrder } from "../../../features/order/orderReducer";
// **LƯU Ý: Không cần import `clearCart` hay `clearOrderDetails` ở đây nữa**

// Helper định dạng tiền tệ
const currency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Math.max(0, Number(v) || 0)
  );

// Danh sách phương thức thanh toán
const paymentMethods = [
  {
    id: "cod",
    name: "Thanh toán khi nhận hàng (COD)",
    description: "Trả tiền mặt trực tiếp cho nhân viên giao hàng.",
  },
  // {
  //   id: "momo",
  //   name: "Ví điện tử Momo",
  //   description: "Thanh toán an toàn và nhanh chóng qua ứng dụng Momo.",
  // },
  {
    id: "vnpay",
    name: "Cổng thanh toán VNPAY",
    description: "Hỗ trợ thẻ ATM nội địa, thẻ quốc tế Visa, Master, JCB.",
  },
];

export default function PaymentPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Lấy TOÀN BỘ dữ liệu cần thiết từ Redux state
  const {
    orderItems,
    summary,
    shippingInfo,
    customerInfo,
    selectedVoucher,
    usePoints,
    status,
  } = useSelector((state) => state.order);

  // State local
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");
  const [error, setError] = useState("");

  // Redirect về giỏ hàng nếu không có đủ thông tin
  useEffect(() => {
    if (!shippingInfo?.fullAddress || !orderItems || orderItems.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [orderItems, shippingInfo, navigate]);

  // Tính toán phí vận chuyển và tổng tiền
  const shippingFee = useMemo(() => {
    if (!shippingInfo?.provinceName) return 30000;
    const provinceNormalized = shippingInfo.provinceName
      .normalize("NFD")
      .replace(/[\u00c0-\u024f]/g, "")
      .toLowerCase();
    return provinceNormalized.includes("ho chi minh") ? 15000 : 30000;
  }, [shippingInfo]);

  const finalTotal = summary.finalTotal + shippingFee;

  // Hàm xử lý khi nhấn "Hoàn tất đơn hàng"
  const handleCompleteOrder = () => {
    if (!selectedPaymentMethod) {
      setError("Vui lòng chọn một phương thức thanh toán.");
      return;
    }
    setError("");

    const finalOrderData = {
      orderItems,
      customerInfo,
      shippingInfo,
      summary: { ...summary, shippingFee, finalTotal },
      paymentMethod: selectedPaymentMethod,
      selectedVoucher,
      usePoints,
    };

    dispatch(createOrder(finalOrderData))
      .unwrap()
      .then((createdOrder) => {
        // **LOGIC ĐÃ ĐƯỢC SỬA:**
        // KHÔNG dọn dẹp state ở đây.
        // Chỉ điều hướng đến trang thành công.
        navigate("/order-success", {
          state: { orderId: createdOrder._id },
          replace: true,
        });
      })
      .catch((errorMsg) => {
        setError(`Đặt hàng thất bại: ${errorMsg}`);
        window.scrollTo(0, 0);
      });
  };

  // Tránh render lỗi nếu dữ liệu chưa sẵn sàng
  if (!shippingInfo || !customerInfo || !summary) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Thanh toán & Chi tiết Đơn hàng</h2>
      <Row className="g-4">
        <Col md={7}>
          {error && <Alert variant="danger">{error}</Alert>}
          <Card className="shadow-sm mb-4">
            <Card.Header as="h5">1. Thông tin nhận hàng</Card.Header>
            <Card.Body>
              <p>
                <strong>Khách hàng:</strong> {customerInfo.name} (
                {customerInfo.phone})
              </p>
              <p className="mb-0">
                <strong>Giao đến:</strong> {shippingInfo.fullAddress}
              </p>
              {shippingInfo.note && (
                <p className="mt-2 mb-0 fst-italic">
                  <strong>Ghi chú:</strong> "{shippingInfo.note}"
                </p>
              )}
            </Card.Body>
          </Card>
          <Card className="shadow-sm mb-4">
            <Card.Header as="h5">
              2. Chi tiết sản phẩm ({orderItems.length})
            </Card.Header>
            <ListGroup variant="flush">
              {orderItems.map((item) => (
                <ListGroup.Item
                  key={item.variant._id}
                  className="d-flex align-items-center"
                >
                  <Image
                    src={item.variant.image}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                    }}
                    rounded
                  />
                  <div className="ms-3 flex-grow-1">
                    <div className="fw-semibold">{item.variant.name}</div>
                    <div className="text-muted small">
                      Số lượng: {item.quantity}
                    </div>
                  </div>
                  <div className="fw-semibold">
                    {currency(item.variant.price * item.quantity)}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
          <Card className="shadow-sm">
            <Card.Header as="h5">3. Chọn phương thức thanh toán</Card.Header>
            <Card.Body>
              <Form>
                {paymentMethods.map((method) => (
                  <Card key={method.id} className="mb-3">
                    <Card.Body>
                      <Form.Check
                        type="radio"
                        id={`payment-${method.id}`}
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={() => {
                          setSelectedPaymentMethod(method.id);
                          setError("");
                        }}
                        label={
                          <span className="fw-semibold fs-5">
                            {method.name}
                          </span>
                        }
                      />
                      <p className="text-muted ms-4 mt-1 mb-0">
                        {method.description}
                      </p>
                    </Card.Body>
                  </Card>
                ))}
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
          <Card className="shadow-sm">
            <Card.Header as="h5">Tóm tắt đơn hàng</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Tạm tính</span>
                <span>{currency(summary.subtotal)}</span>
              </div>
              {summary.voucherDiscount + summary.pointsDiscount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Khuyến mãi</span>
                  <span>
                    -
                    {currency(summary.voucherDiscount + summary.pointsDiscount)}
                  </span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-2">
                <span>Phí vận chuyển</span>
                <span>{currency(shippingFee)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                <span>Tổng cộng</span>
                <span className="text-danger">{currency(finalTotal)}</span>
              </div>
              <Button
                variant="danger"
                className="w-100 py-2"
                onClick={handleCompleteOrder}
                disabled={status.createOrder === "loading"}
              >
                {status.createOrder === "loading" ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  "Hoàn tất đơn hàng"
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
