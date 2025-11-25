import { useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Table,
  Button,
  Image,
  InputGroup,
  Modal,
  ListGroup,
  Badge,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  toggleAllItems,
  toggleItem,
  changeQty,
  removeItem,
  removeSelected,
  applyVoucher,
  clearVoucher,
  toggleUsePoints,
} from "../../../features/cart/cartReducer";
import { FaShoppingCart } from "react-icons/fa";

// ===== Helpers =====
const currency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Math.max(0, Number(v) || 0)
  );

// Điểm thưởng: mặc định 1 điểm = 1,000đ
const POINT_TO_VND = 1000;

// ===== Demo data =====
const DEMO_VOUCHERS = [
  {
    code: "SAVE10",
    discountType: "PERCENT",
    discountValue: 10,
    description: "Giảm 10% cho đơn hàng đầu tiên của bạn.",
  },
  {
    code: "LAP50K",
    discountType: "AMOUNT",
    discountValue: 50000,
    description: "Giảm 50.000đ cho đơn hàng từ 1.000.000đ.",
  },
];

export default function CartPage() {
  const [keyword, setKeyword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, selectedVoucher, usePoints } = useSelector(
    (state) => state.cart
  );

  const [voucherModal, setVoucherModal] = useState(false);
  const [vouchers] = useState(DEMO_VOUCHERS);
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [userPoints] = useState(458);

  const filteredItems = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return cartItems;
    return cartItems.filter(
      (x) =>
        x.name.toLowerCase().includes(k) ||
        x.variantName.toLowerCase().includes(k)
    );
  }, [cartItems, keyword]);

  const allChecked = useMemo(() => {
    return (
      Array.isArray(cartItems) &&
      cartItems.length > 0 &&
      cartItems.every((x) => x.checked === true)
    );
  }, [cartItems]);

  const totalCount = Array.isArray(cartItems) ? cartItems.length : 0;
  const selectedCount = Array.isArray(cartItems)
    ? cartItems.filter((x) => x.checked).length
    : 0;

  const selectedSubtotal = useMemo(() => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems
      .filter((x) => x.checked)
      .reduce((s, it) => s + it.price * it.quantity, 0);
  }, [cartItems]);

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

  // Handlers sử dụng dispatch, đã được cập nhật để dùng variantId
  const toggleAll = (checked) => dispatch(toggleAllItems(checked));
  const toggleOne = (variantId, checked) =>
    dispatch(toggleItem({ variantId, checked }));
  const handleChangeQty = (variantId, delta) =>
    dispatch(changeQty({ variantId, delta }));
  const removeOne = (variantId) => dispatch(removeItem(variantId));
  const handleRemoveSelected = () => dispatch(removeSelected());

  const openVoucher = () => {
    setVoucherCodeInput("");
    setVoucherModal(true);
  };
  const closeVoucher = () => setVoucherModal(false);

  const handleApplyVoucher = (v) => {
    dispatch(applyVoucher(v));
    setVoucherModal(false);
  };
  const handleClearVoucher = () => dispatch(clearVoucher());

  const handleApplyVoucherByCode = () => {
    const found = vouchers.find(
      (v) => v.code.toLowerCase() === voucherCodeInput.trim().toLowerCase()
    );
    if (!found) {
      alert("Mã voucher không tồn tại trong ví của bạn.");
      return;
    }
    handleApplyVoucher(found);
  };

  const handleToggleUsePoints = (e) => {
    dispatch(toggleUsePoints(e.target.checked));
  };

  return (
    <Container className="py-3">
      <h2 className="mb-4">Giỏ Hàng Của Bạn</h2>
      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Tìm trong giỏ hàng..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </InputGroup>

      <div className="d-flex align-items-center gap-3 mb-2">
        <Form.Check
          type="checkbox"
          id="top-check-all"
          checked={allChecked}
          onChange={(e) => toggleAll(e.target.checked)}
          label="Chọn tất cả sản phẩm"
        />
      </div>

      <Table
        responsive
        hover
        className="align-middle bg-white rounded shadow-sm"
      >
        <thead>
          <tr>
            <th style={{ width: "5%" }}></th>
            <th style={{ width: "40%" }}>Sản phẩm</th>
            <th className="text-end" style={{ width: "15%" }}>
              Đơn giá
            </th>
            <th className="text-center" style={{ width: "15%" }}>
              Số lượng
            </th>
            <th className="text-end" style={{ width: "15%" }}>
              Thành tiền
            </th>
            <th className="text-center" style={{ width: "10%" }}>
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((it) => (
            <tr key={it.variantId}>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={it.checked || false}
                  onChange={(e) => toggleOne(it.variantId, e.target.checked)}
                />
              </td>
              <td>
                <Row className="g-2 align-items-center">
                  <Col xs="auto">
                    <Image
                      src={it.image}
                      rounded
                      width={72}
                      height={72}
                      style={{ objectFit: "contain" }}
                    />
                  </Col>
                  <Col className="text-start">
                    <div className="fw-semibold">{it.name}</div>
                    <div className="text-muted small">
                      Phân loại: {it.variantName}
                    </div>
                  </Col>
                </Row>
              </td>
              <td className="text-end">{currency(it.price)}</td>
              <td className="text-center">
                <div className="d-inline-flex align-items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => handleChangeQty(it.variantId, -1)}
                    disabled={it.quantity <= 1}
                  >
                    −
                  </Button>
                  <Form.Control
                    value={it.quantity}
                    readOnly
                    className="text-center"
                    style={{ width: 56 }}
                  />
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => handleChangeQty(it.variantId, 1)}
                  >
                    +
                  </Button>
                </div>
              </td>
              <td className="text-end text-danger fw-semibold">
                {currency(it.price * it.quantity)}
              </td>
              <td className="text-center">
                <Button
                  variant="link"
                  className="text-dark p-0"
                  onClick={() => removeOne(it.variantId)}
                >
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
          {filteredItems.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-5">
                <div className="mb-2">
                  <FaShoppingCart size="3rem" className="text-muted" />
                </div>
                Giỏ hàng của bạn đang trống.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <div
        className="border-top bg-white p-3"
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 1030,
          boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Row className="g-3 align-items-center">
          <Col md={5} className="d-flex align-items-center gap-3">
            <Form.Check
              type="checkbox"
              id="bottom-check-all"
              checked={allChecked}
              onChange={(e) => toggleAll(e.target.checked)}
              label={`Chọn tất cả (${totalCount})`}
            />
            <Button
              variant="link"
              className="text-danger p-0 ms-2"
              onClick={handleRemoveSelected}
              disabled={selectedCount === 0}
            >
              Xóa ({selectedCount})
            </Button>
          </Col>

          <Col md={7}>
            <div className="d-flex align-items-center gap-2 mb-3 justify-content-end">
              <Badge bg="danger">Voucher</Badge>
              {selectedVoucher ? (
                <>
                  <span className="small">{selectedVoucher.code}</span>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={openVoucher}
                  >
                    Đổi
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleClearVoucher}
                  >
                    Xóa
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={openVoucher}
                >
                  Chọn hoặc nhập mã
                </Button>
              )}
              {voucherDiscount > 0 && (
                <div className="small text-danger ms-1">
                  -{currency(voucherDiscount)}
                </div>
              )}
            </div>

            <div className="d-flex align-items-center gap-2 mb-3 justify-content-end">
              <Form.Check
                type="checkbox"
                id="use-points"
                checked={usePoints}
                onChange={handleToggleUsePoints}
              />
              <label htmlFor="use-points" className="m-0 small">
                <Badge bg="warning" text="dark">
                  Điểm thưởng
                </Badge>{" "}
                <span className="text-muted">
                  (Bạn có {userPoints.toLocaleString()} điểm ~{" "}
                  {currency(pointBalanceVnd)})
                </span>
              </label>
              {usePoints && pointsAppliedVnd > 0 && (
                <div className="small text-danger">
                  -{currency(pointsAppliedVnd)}
                </div>
              )}
            </div>

            <div className="d-flex align-items-center gap-3 justify-content-end">
              <div className="text-end">
                <div className="small">
                  Tổng thanh toán ({selectedCount} sản phẩm):
                </div>
                <div className="fs-5 fw-semibold text-danger">
                  {currency(payable)}
                </div>
                {savings > 0 && (
                  <div className="small text-muted">
                    Tiết kiệm {currency(savings)}
                  </div>
                )}
              </div>
              <Button
                variant="danger"
                size="lg"
                disabled={selectedCount === 0}
                onClick={() => navigate("/order")}
              >
                Mua hàng
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      <Modal show={voucherModal} onHide={closeVoucher} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chọn / Nhập mã voucher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Nhập mã voucher"
              value={voucherCodeInput}
              onChange={(e) => setVoucherCodeInput(e.target.value)}
            />
            <Button variant="dark" onClick={handleApplyVoucherByCode}>
              Áp dụng
            </Button>
          </InputGroup>
          <div className="mb-2 fw-semibold">Voucher của bạn</div>
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            <ListGroup variant="flush" className="border rounded">
              {vouchers.map((v) => (
                <ListGroup.Item key={v.code} className="py-3">
                  <Row className="g-3 align-items-center">
                    <Col xs="auto">
                      <div
                        className="rounded-2 border bg-light d-flex align-items-center justify-content-center"
                        style={{ width: 56, height: 56, fontWeight: 700 }}
                      >
                        {v.discountType === "PERCENT" ? "%" : "₫"}
                      </div>
                    </Col>
                    <Col>
                      <Badge bg="dark">{v.code}</Badge>
                      <div className="text-muted mt-1 small">
                        {v.description}
                      </div>
                    </Col>
                    <Col xs="auto">
                      <Button
                        variant="warning"
                        onClick={() => handleApplyVoucher(v)}
                      >
                        Áp dụng
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
