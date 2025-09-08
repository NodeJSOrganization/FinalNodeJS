import { useState, useMemo, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
  Image,
  Alert,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// ===== Helpers =====
const currency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Math.max(0, Number(v) || 0)
  );
const POINT_TO_VND = 1000;

export default function OrderPage() {
  const navigate = useNavigate();

  // Lấy tất cả state cần thiết từ Redux
  const { cartItems, selectedVoucher, usePoints } = useSelector(
    (state) => state.cart
  );
  const { currentUser, isAuthenticated } = useSelector((state) => state.user); // Giả sử có user slice

  // State cục bộ cho form và lỗi
  const [formError, setFormError] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [shippingInfo, setShippingInfo] = useState({
    receiverName: "",
    receiverPhone: "",
    address: "",
    note: "",
  });

  // Tự động điền thông tin nếu người dùng đã đăng nhập
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setCustomerInfo({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
      });
      setShippingInfo((prev) => ({
        ...prev,
        receiverName: currentUser.name || "",
        receiverPhone: currentUser.phone || "",
        address: currentUser.address || "",
      }));
    }
  }, [isAuthenticated, currentUser]);

  const selectedCartItems = useMemo(
    () => cartItems.filter((item) => item.checked),
    [cartItems]
  );

  // // Điều hướng về giỏ hàng nếu không có sản phẩm nào được chọn
  // useEffect(() => {
  //   if (selectedCartItems.length === 0) {
  //     navigate("/cart");
  //   }
  // }, [selectedCartItems, navigate]);

  useEffect(() => {
    if (selectedCartItems.length === 0) {
      navigate("/cart", {
        replace: true,
        state: { message: "Vui lòng chọn sản phẩm để tiến hành đặt hàng." }, // Gửi tin nhắn
      });
    }
  }, []);

  // Tính toán lại các giá trị dựa trên state từ Redux
  const [userPoints] = useState(458); // Ví dụ điểm của người dùng

  const selectedSubtotal = useMemo(
    () => selectedCartItems.reduce((s, it) => s + it.price * it.qty, 0),
    [selectedCartItems]
  );

  const voucherDiscount = useMemo(() => {
    if (!selectedVoucher) return 0;
    if (selectedVoucher.discountType === "AMOUNT") {
      return Math.min(selectedVoucher.discountValue, selectedSubtotal);
    }
    return Math.floor((selectedSubtotal * selectedVoucher.discountValue) / 100);
  }, [selectedVoucher, selectedSubtotal]);

  const pointBalanceVnd = userPoints * POINT_TO_VND;
  const pointsAppliedVnd = useMemo(() => {
    if (!usePoints) return 0;
    const remainAfterVoucher = Math.max(0, selectedSubtotal - voucherDiscount);
    return Math.min(pointBalanceVnd, remainAfterVoucher);
  }, [usePoints, pointBalanceVnd, selectedSubtotal, voucherDiscount]);

  const savings = voucherDiscount + pointsAppliedVnd;
  const payable = Math.max(0, selectedSubtotal - savings);

  const handleInputChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (
      !customerInfo.name.trim() ||
      !customerInfo.email.trim() ||
      !customerInfo.phone.trim() ||
      !shippingInfo.receiverName.trim() ||
      !shippingInfo.receiverPhone.trim() ||
      !shippingInfo.address.trim()
    ) {
      setFormError("Vui lòng điền đầy đủ các thông tin bắt buộc (*).");
      window.scrollTo(0, 0); // Cuộn lên đầu trang để người dùng thấy lỗi
      return;
    }
    setFormError("");

    navigate("/payment", {
      state: {
        orderItems: selectedCartItems,
        customerInfo,
        shippingInfo,
        subtotal: selectedSubtotal,
        savings,
        payable,
      },
    });
  };

  if (selectedCartItems.length === 0) return null;

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Xác nhận Đặt hàng</h2>
      <Form onSubmit={handleProceedToPayment}>
        <Row className="g-4">
          <Col md={7}>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Card className="mb-4 shadow-sm">
              <Card.Header as="h5">Thông tin khách hàng</Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Họ và tên <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange(setCustomerInfo)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Email <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange(setCustomerInfo)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Số điện thoại <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange(setCustomerInfo)}
                    required
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            <Card className="mb-4 shadow-sm">
              <Card.Header as="h5">Thông tin nhận hàng</Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Tên người nhận <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="receiverName"
                    value={shippingInfo.receiverName}
                    onChange={handleInputChange(setShippingInfo)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Số điện thoại nhận hàng{" "}
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="receiverPhone"
                    value={shippingInfo.receiverPhone}
                    onChange={handleInputChange(setShippingInfo)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Địa chỉ nhận hàng <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange(setShippingInfo)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Ghi chú (tùy chọn)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="note"
                    value={shippingInfo.note}
                    onChange={handleInputChange(setShippingInfo)}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col md={5}>
            <Card className="mb-4 shadow-sm sticky-top" style={{ top: "20px" }}>
              <Card.Header as="h5">
                Sản phẩm đã chọn ({selectedCartItems.length})
              </Card.Header>
              <ListGroup
                variant="flush"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                {selectedCartItems.map((item) => (
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
                      <div className="text-muted small">
                        Số lượng: {item.qty}
                      </div>
                    </div>
                    <div className="fw-semibold">
                      {currency(item.price * item.qty)}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính</span>
                  <span>{currency(selectedSubtotal)}</span>
                </div>
                {savings > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-danger">
                    <span>Giảm giá</span>
                    <span>-{currency(savings)}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between fw-semibold fs-5 mb-3">
                  <span>Tổng cộng</span>
                  <span className="text-danger">{currency(payable)}</span>
                </div>
                <Button variant="danger" type="submit" className="w-100 py-2">
                  Tiến hành Thanh toán
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
