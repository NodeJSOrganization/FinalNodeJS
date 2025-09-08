import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
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
} from "react-bootstrap";

import { clearOrderDetails } from "../../../features/order/orderReducer";
import { clearSelectedItems } from "../../../features/cart/cartReducer";

const currency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Math.max(0, Number(v) || 0)
  );

const paymentMethods = [
  {
    id: "cod",
    name: "Thanh toán khi nhận hàng (COD)",
    description: "Trả tiền mặt trực tiếp cho nhân viên giao hàng.",
  },
  {
    id: "momo",
    name: "Ví điện tử Momo",
    description: "Thanh toán an toàn và nhanh chóng qua ứng dụng Momo.",
  },
  {
    id: "vnpay",
    name: "Cổng thanh toán VNPAY",
    description: "Hỗ trợ thẻ ATM nội địa, thẻ quốc tế Visa, Master, JCB.",
  },
];

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const orderData = location.state;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderData) {
      navigate("/cart");
    }
  }, [orderData, navigate]);

  const shippingFee = useMemo(() => {
    if (!orderData?.shippingInfo?.provinceName) {
      return 30000;
    }
    const provinceNormalized = orderData.shippingInfo.provinceName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (provinceNormalized.includes("ho chi minh")) {
      return 15000;
    }

    return 30000;
  }, [orderData]);

  if (!orderData) {
    return null;
  }

  const { orderItems, customerInfo, shippingInfo, subtotal, savings, payable } =
    orderData;
  const finalTotal = payable + shippingFee;

  const handleCompleteOrder = () => {
    if (!selectedPaymentMethod) {
      setError("Vui lòng chọn một phương thức thanh toán.");
      return;
    }

    const generatedOrderId = "DH" + Date.now();

    const finalOrder = {
      ...orderData,
      orderId: generatedOrderId,
      shippingFee: shippingFee,
      finalTotal: finalTotal,
      paymentMethod: selectedPaymentMethod,
      orderDate: new Date().toISOString(),
    };

    console.log("SENDING FINAL ORDER TO SERVER:", finalOrder);

    dispatch(clearSelectedItems());
    dispatch(clearOrderDetails());

    navigate("/order-success", { state: { orderId: generatedOrderId } });
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Thanh toán & Chi tiết Đơn hàng</h2>
      <Row className="g-4">
        <Col md={7}>
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
                  key={item.id}
                  className="d-flex align-items-center"
                >
                  <Image
                    src={item.image}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                    }}
                    rounded
                  />
                  <div className="ms-3 flex-grow-1">
                    <div className="fw-semibold">{item.name}</div>
                    <div className="text-muted small">Số lượng: {item.qty}</div>
                  </div>
                  <div className="fw-semibold">
                    {currency(item.price * item.qty)}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          <Card className="shadow-sm">
            <Card.Header as="h5">3. Chọn phương thức thanh toán</Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
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
          <Card className="shadow-sm sticky-top" style={{ top: "20px" }}>
            <Card.Header as="h5">Tóm tắt đơn hàng</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Tạm tính</span>
                <span>{currency(subtotal)}</span>
              </div>
              {savings > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-success">Khuyến mãi</span>
                  <span className="text-success">-{currency(savings)}</span>
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
              >
                Hoàn tất đơn hàng
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
