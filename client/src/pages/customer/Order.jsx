import { useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
  Image,
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCartItems } from "../../../features/cart/cartReducer";

const currency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Math.max(0, Number(v) || 0)
  );
const POINT_TO_VND = 1000;

export default function Order() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);

  const selectedCartItems = useMemo(
    () => cartItems.filter((item) => item.checked),
    [cartItems]
  );

  // Nếu không có sản phẩm nào được chọn, chuyển hướng về giỏ hàng
  if (selectedCartItems.length === 0) {
    navigate("/cart");
    return null; // Không render gì cho đến khi chuyển hướng
  }

  // State cho thông tin khách hàng
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // State cho thông tin nhận hàng
  const [shippingInfo, setShippingInfo] = useState({
    receiverName: "",
    receiverPhone: "",
    address: "",
    note: "", // Ghi chú tùy chọn
  });

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  // ====== Derived values cho tóm tắt đơn hàng (có thể copy từ CartPage) ======
  // Giả định voucher và điểm thưởng đã được áp dụng ở CartPage và muốn duy trì ở đây.
  // Trong một hệ thống thực tế, bạn sẽ lưu trạng thái voucher/điểm thưởng vào Redux
  // hoặc truyền qua URL/local storage nếu muốn giữ lại.
  // Ở đây, tôi sẽ đơn giản tính toán lại based on selected items.

  // NOTE: Trong một ứng dụng thực tế, bạn nên lưu selectedVoucher và usePoints vào Redux
  // để chúng persist qua các trang. Hiện tại, tôi sẽ bỏ qua phần này để tập trung vào luồng chính.
  // Bạn có thể tự thêm logic để lấy voucher/points từ Redux state nếu đã lưu.

  const userPoints = 458; // ví dụ: 458 điểm ~ 458.000đ
  const usePoints = false; // Mặc định không sử dụng điểm ở trang Order nếu không có trạng thái từ Cart
  const selectedVoucher = null; // Mặc định không có voucher nếu không có trạng thái từ Cart

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

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (
      !customerInfo.name ||
      !customerInfo.email ||
      !customerInfo.phone ||
      !shippingInfo.receiverName ||
      !shippingInfo.receiverPhone ||
      !shippingInfo.address
    ) {
      alert("Vui lòng điền đầy đủ thông tin khách hàng và nhận hàng.");
      return;
    }

    const remainingCartItems = cartItems.filter(
      (item) => !selectedCartItems.includes(item)
    );
    dispatch(setCartItems(remainingCartItems));

    navigate("/payment", {
      state: {
        orderItems: selectedCartItems,
        customerInfo,
        shippingInfo,
        payable,
        savings,
      },
    });
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Xác nhận Đặt hàng</h2>

      <Form onSubmit={handlePlaceOrder}>
        <Row>
          <Col md={7}>
            <Card className="mb-4 shadow-sm">
              <Card.Header className="fw-semibold">
                Thông tin khách hàng
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3" controlId="customerName">
                  <Form.Label>
                    Họ và tên <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleCustomerInfoChange}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="customerEmail">
                  <Form.Label>
                    Email <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleCustomerInfoChange}
                    placeholder="email@example.com"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="customerPhone">
                  <Form.Label>
                    Số điện thoại <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleCustomerInfoChange}
                    placeholder="0123456789"
                    required
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            <Card className="mb-4 shadow-sm">
              <Card.Header className="fw-semibold">
                Thông tin nhận hàng
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3" controlId="receiverName">
                  <Form.Label>
                    Tên người nhận <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="receiverName"
                    value={shippingInfo.receiverName}
                    onChange={handleShippingInfoChange}
                    placeholder="Nguyễn Văn B"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="receiverPhone">
                  <Form.Label>
                    Số điện thoại nhận hàng{" "}
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="receiverPhone"
                    value={shippingInfo.receiverPhone}
                    onChange={handleShippingInfoChange}
                    placeholder="0987654321"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="shippingAddress">
                  <Form.Label>
                    Địa chỉ nhận hàng <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingInfoChange}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="shippingNote">
                  <Form.Label>Ghi chú (tùy chọn)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="note"
                    value={shippingInfo.note}
                    onChange={handleShippingInfoChange}
                    placeholder="Ví dụ: Giao hàng giờ hành chính, gọi trước khi giao..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col md={5}>
            <Card className="mb-4 shadow-sm">
              <Card.Header className="fw-semibold">
                Sản phẩm đã chọn ({selectedCartItems.length})
              </Card.Header>
              <ListGroup variant="flush">
                {selectedCartItems.map((item) => (
                  <ListGroup.Item key={item.id}>
                    <Row className="align-items-center">
                      <Col xs={3}>
                        <Image src={item.image} fluid rounded />
                      </Col>
                      <Col xs={6}>
                        <div className="fw-semibold">{item.name}</div>
                        <div className="text-muted small">
                          {item.variant} x {item.qty}
                        </div>
                      </Col>
                      <Col xs={3} className="text-end">
                        <span className="fw-semibold">
                          {currency(item.price * item.qty)}
                        </span>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>

            <Card className="mb-4 shadow-sm">
              <Card.Header className="fw-semibold">
                Tóm tắt đơn hàng
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>
                    Tổng tiền hàng ({selectedCartItems.length} sản phẩm)
                  </span>
                  <span>{currency(selectedSubtotal)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Voucher giảm giá</span>
                  <span className="text-danger">
                    -{currency(voucherDiscount)}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Số điểm thưởng đã dùng</span>
                  <span className="text-danger">
                    -{currency(pointsAppliedVnd)}
                  </span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-semibold fs-5 mb-3">
                  <span>Tổng cộng phải trả</span>
                  <span className="text-danger">{currency(payable)}</span>
                </div>
                <Button
                  variant="danger"
                  type="submit"
                  className="w-100 py-2"
                  disabled={selectedCartItems.length === 0}
                >
                  Tiến hành Thanh toán
                </Button>
                <div className="text-center text-muted small mt-2">
                  Bằng cách đặt hàng, bạn đồng ý với Điều khoản và Điều kiện của
                  chúng tôi.
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
