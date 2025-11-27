import { useState, useEffect } from "react";
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
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

// Import các actions cần thiết từ orderSlice
import {
  saveShippingInfo,
  saveCustomerInfo,
  fetchProvinces,
  updateShippingInfo,
} from "../../../features/order/orderReducer";

import AddressSelector from "../../components/product/AddressSelector";

// Helper định dạng tiền tệ
const currency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Math.max(0, Number(v) || 0)
  );

export default function OrderPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- Lấy dữ liệu chính từ Redux ---
  const {
    orderItems,
    summary,
    shippingInfo: reduxShippingInfo,
  } = useSelector((state) => state.order);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [formError, setFormError] = useState("");
  // `customerInfo` chỉ dành cho khách, người đã đăng nhập sẽ dùng thông tin từ `user`
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [receiverInfo, setReceiverInfo] = useState({
    receiverName: "",
    receiverPhone: "",
    detail: "",
    note: "",
  });

  useEffect(() => {
    dispatch(fetchProvinces());
  }, [dispatch]);

  useEffect(() => {
    // Tự động điền thông tin người nhận hàng từ thông tin user đã đăng nhập
    if (isAuthenticated && user) {
      setCustomerInfo({
        name: user.fullName || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
      });

      setReceiverInfo((prev) => ({
        ...prev,
        receiverName: user.fullName || "",
        receiverPhone: user.phoneNumber || "",
        detail: user.address?.streetAddress || "",
      }));
      if (user.address) {
        const { province, district, ward } = user.address;

        // Dispatch để cập nhật Tỉnh/Thành phố vào Redux
        // Component AddressSelector sẽ dựa vào đây để hiển thị
        if (province) {
          dispatch(
            updateShippingInfo({ field: "provinceName", value: province })
          );
        }
        // Tương tự cho Quận/Huyện và Phường/Xã
        if (district) {
          dispatch(
            updateShippingInfo({ field: "districtName", value: district })
          );
        }
        if (ward) {
          dispatch(updateShippingInfo({ field: "wardName", value: ward }));
        }
        // Ghi chú: Component AddressSelector của bạn cần được thiết kế để
        // có thể nhận và hiển thị các giá trị mặc định này.
      }
    }
  }, [isAuthenticated, user]);

  // Kiểm tra nếu không có sản phẩm thì quay về giỏ hàng
  useEffect(() => {
    // Thêm điều kiện `!summary` để chắc chắn dữ liệu đã được khởi tạo
    if (!summary || orderItems.length === 0) {
      navigate("/cart", {
        replace: true,
        state: { message: "Vui lòng chọn sản phẩm để đặt hàng." },
      });
    }
  }, [orderItems, summary, navigate]);

  // --- Handlers ---
  const handleCustomerInfoChange = (e) => {
    setCustomerInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReceiverInfoChange = (e) => {
    setReceiverInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();

    // Lấy thông tin Tỉnh/Huyện/Xã từ Redux (do component AddressSelector cập nhật)
    const {
      provinceCode,
      provinceName,
      districtCode,
      districtName,
      wardCode,
      wardName,
    } = reduxShippingInfo;

    // Gộp thông tin khách hàng: ưu tiên user đã đăng nhập, nếu là khách thì lấy từ form
    const finalCustomerInfo = isAuthenticated
      ? {
          name: user.fullName,
          email: user.email,
          phone: user.phoneNumber,
        }
      : customerInfo;

    // Validation
    if (
      !finalCustomerInfo.name.trim() ||
      !finalCustomerInfo.email.trim() ||
      !finalCustomerInfo.phone.trim() ||
      !receiverInfo.receiverName.trim() ||
      !receiverInfo.receiverPhone.trim() ||
      !provinceCode ||
      !districtCode ||
      !wardCode ||
      !receiverInfo.detail.trim()
    ) {
      setFormError("Vui lòng điền đầy đủ các thông tin bắt buộc (*).");
      window.scrollTo(0, 0);
      return;
    }
    setFormError("");

    const fullAddress = `${receiverInfo.detail}, ${wardName}, ${districtName}, ${provinceName}`;

    const finalShippingInfo = {
      ...receiverInfo,
      provinceCode,
      provinceName,
      districtCode,
      districtName,
      wardCode,
      wardName,
      fullAddress,
    };

    // **BƯỚC QUAN TRỌNG:**
    // 1. Lưu thông tin khách hàng vào Redux
    dispatch(saveCustomerInfo(finalCustomerInfo));
    // 2. Lưu thông tin giao hàng vào Redux
    dispatch(saveShippingInfo(finalShippingInfo));
    // 3. Điều hướng
    navigate("/payment");
  };

  // Vẫn cần kiểm tra này để tránh lỗi render trong khoảnh khắc đầu tiên
  if (!orderItems || orderItems.length === 0) return null;

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Xác nhận đặt hàng</h2>
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
                    value={isAuthenticated ? user.fullName : customerInfo.name}
                    onChange={handleCustomerInfoChange}
                    readOnly={isAuthenticated}
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
                    value={isAuthenticated ? user.email : customerInfo.email}
                    onChange={handleCustomerInfoChange}
                    readOnly={isAuthenticated}
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
                    value={
                      isAuthenticated ? user.phoneNumber : customerInfo.phone
                    }
                    onChange={handleCustomerInfoChange}
                    readOnly={isAuthenticated}
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
                    value={receiverInfo.receiverName}
                    onChange={handleReceiverInfoChange}
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
                    value={receiverInfo.receiverPhone}
                    onChange={handleReceiverInfoChange}
                    required
                  />
                </Form.Group>
                <AddressSelector />
                <Form.Group className="mt-3">
                  <Form.Label>
                    Địa chỉ chi tiết (Số nhà, tên đường...){" "}
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="detail"
                    value={receiverInfo.detail}
                    onChange={handleReceiverInfoChange}
                    placeholder="Ví dụ: 123 Đường ABC"
                    required
                  />
                </Form.Group>
                <Form.Group className="mt-3">
                  <Form.Label>Ghi chú (tùy chọn)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="note"
                    value={receiverInfo.note}
                    onChange={handleReceiverInfoChange}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col md={5}>
            <Card className="mb-4 shadow-sm sticky-top" style={{ top: "20px" }}>
              <Card.Header as="h5">
                Sản phẩm đã chọn ({orderItems.length})
              </Card.Header>
              <ListGroup
                variant="flush"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
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
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính</span>
                  <span>{currency(summary.subtotal)}</span>
                </div>
                {summary.voucherDiscount + summary.pointsDiscount > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-danger">
                    <span>Giảm giá</span>
                    <span>
                      -
                      {currency(
                        summary.voucherDiscount + summary.pointsDiscount
                      )}
                    </span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between fw-semibold fs-5 mb-3">
                  <span>Tổng cộng</span>
                  <span className="text-danger">
                    {currency(summary.finalTotal)}
                  </span>
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
