import { useMemo, useState, useEffect } from "react";
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
  Spinner,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

// Import đầy đủ các actions và thunks từ Redux
import {
  syncCart,
  updateItemQuantity,
  removeItem as removeItemThunk,
  toggleAllItems,
  toggleItem,
  applyVoucher,
  clearVoucher,
  toggleUsePoints,
  fetchVouchers,
} from "../../../features/cart/cartReducer";

import { createOrderSummary } from "../../../features/order/orderReducer";

// Helper định dạng tiền tệ
const currency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Math.max(0, Number(v) || 0)
  );

const POINT_TO_VND = 1000;

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy state từ Redux
  const { cartItems, selectedVoucher, usePoints, vouchers, isLoading } =
    useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  // State local
  const [keyword, setKeyword] = useState("");
  const [voucherModal, setVoucherModal] = useState(false);
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const userPoints = user?.loyaltyPoints || 0;

  // useEffect để lấy giỏ hàng, voucher và xử lý "Mua ngay"
  useEffect(() => {
    const checkoutVariantId = location.state?.checkoutVariantId;
    dispatch(syncCart())
      .unwrap()
      .then(() => {
        if (checkoutVariantId) {
          dispatch(toggleAllItems(false));
          dispatch(toggleItem({ variantId: checkoutVariantId, checked: true }));
          navigate(location.pathname, { replace: true, state: {} });
        }
      });

    dispatch(fetchVouchers());
  }, [dispatch, location, navigate]);

  // --- Logic tính toán (useMemo) ---
  const filteredItems = useMemo(() => {
    if (!cartItems) return [];
    const k = keyword.trim().toLowerCase();
    if (!k) return cartItems;
    return cartItems.filter(
      (x) =>
        x.variant?.name?.toLowerCase().includes(k) ||
        x.variant?.variantName?.toLowerCase().includes(k)
    );
  }, [cartItems, keyword]);

  const allChecked = useMemo(
    () =>
      cartItems &&
      cartItems.length > 0 &&
      cartItems.every((x) => x.checked === true),
    [cartItems]
  );
  const selectedItems = useMemo(
    () => (cartItems ? cartItems.filter((x) => x.checked) : []),
    [cartItems]
  );
  const totalCount = cartItems ? cartItems.length : 0;
  const selectedCount = selectedItems.length;

  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce(
      (s, it) => s + it.variant.price * it.quantity,
      0
    );
  }, [selectedItems]);

  const voucherDiscount = useMemo(() => {
    if (!selectedVoucher || selectedSubtotal === 0) return 0;
    if (selectedVoucher.type === "fixed_amount") {
      return Math.min(selectedVoucher.value, selectedSubtotal);
    }
    if (selectedVoucher.type === "percent") {
      return Math.floor((selectedSubtotal * selectedVoucher.value) / 100);
    }
    return 0;
  }, [selectedVoucher, selectedSubtotal]);

  const pointBalanceVnd = userPoints * POINT_TO_VND;
  const pointsDiscount = useMemo(() => {
    if (!usePoints) return 0;
    const remainAfterVoucher = Math.max(0, selectedSubtotal - voucherDiscount);
    return Math.min(pointBalanceVnd, remainAfterVoucher);
  }, [usePoints, pointBalanceVnd, selectedSubtotal, voucherDiscount]);

  const savings = voucherDiscount + pointsDiscount;
  const finalTotal = Math.max(0, selectedSubtotal - savings);

  // --- Handlers ---
  const toggleAll = (checked) => dispatch(toggleAllItems(checked));
  const toggleOne = (variantId, checked) =>
    dispatch(toggleItem({ variantId, checked }));
  const handleChangeQty = (variantId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateItemQuantity({ variantId, quantity: newQuantity }));
  };
  const removeOne = (variantId) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      dispatch(removeItemThunk(variantId));
    }
  };
  const handleRemoveSelected = () => {
    if (
      window.confirm(`Bạn có chắc muốn xóa ${selectedCount} sản phẩm đã chọn?`)
    ) {
      const selectedVariantIds = selectedItems.map((item) => item.variant._id);
      selectedVariantIds.forEach((id) => dispatch(removeItemThunk(id)));
    }
  };
  const openVoucher = () => setVoucherModal(true);
  const closeVoucher = () => setVoucherModal(false);
  const handleApplyVoucher = (voucher) => {
    dispatch(applyVoucher(voucher));
    closeVoucher();
  };
  const handleClearVoucher = () => dispatch(clearVoucher());
  const handleApplyVoucherByCode = () => {
    const code = voucherCodeInput.trim().toUpperCase();
    const found = vouchers.find((v) => v.code.toUpperCase() === code);
    if (!found) {
      alert("Mã voucher không hợp lệ hoặc không có sẵn.");
      return;
    }
    handleApplyVoucher(found);
  };
  const handleToggleUsePoints = (e) =>
    dispatch(toggleUsePoints(e.target.checked));

  const handleProceedToOrder = () => {
    const summaryData = {
      orderItems: selectedItems,
      subtotal: selectedSubtotal,
      voucherDiscount,
      pointsDiscount,
      finalTotal,
      selectedVoucher,
      usePoints,
    };
    dispatch(createOrderSummary(summaryData));
    navigate("/order");
  };

  if (isLoading && !cartItems?.length) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

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
          {filteredItems && filteredItems.length > 0 ? (
            filteredItems.map((it) => (
              <tr key={it.variant._id}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={it.checked || false}
                    onChange={(e) =>
                      toggleOne(it.variant._id, e.target.checked)
                    }
                  />
                </td>
                <td>
                  <Row className="g-2 align-items-center">
                    <Col xs="auto">
                      <Image
                        src={it.variant.image || it.product?.images[0]?.url}
                        rounded
                        width={72}
                        height={72}
                        style={{ objectFit: "contain" }}
                      />
                    </Col>
                    <Col className="text-start">
                      <div className="fw-semibold">{it.variant.name}</div>
                      <div className="text-muted small">
                        Phân loại: {it.variant.variantName}
                      </div>
                    </Col>
                  </Row>
                </td>
                <td className="text-end">{currency(it.variant.price)}</td>
                <td className="text-center">
                  <div className="d-inline-flex align-items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() =>
                        handleChangeQty(it.variant._id, it.quantity - 1)
                      }
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
                      onClick={() =>
                        handleChangeQty(it.variant._id, it.quantity + 1)
                      }
                    >
                      +
                    </Button>
                  </div>
                </td>
                <td className="text-end text-danger fw-semibold">
                  {currency(it.variant.price * it.quantity)}
                </td>
                <td className="text-center">
                  <Button
                    variant="link"
                    className="text-dark p-0"
                    onClick={() => removeOne(it.variant._id)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))
          ) : (
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
      <div className="border-top bg-white p-3 sticky-bottom">
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
                  <span className="small fw-bold">{selectedVoucher.code}</span>
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
                    onClick={() => dispatch(clearVoucher())}
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
                </Badge>
                <span className="text-muted">
                  (Bạn có {userPoints.toLocaleString()} điểm ~{" "}
                  {currency(pointBalanceVnd)})
                </span>
              </label>
              {pointsDiscount > 0 && (
                <div className="small text-danger">
                  -{currency(pointsDiscount)}
                </div>
              )}
            </div>
            <div className="d-flex align-items-center gap-3 justify-content-end">
              <div className="text-end">
                <div className="small">
                  Tổng thanh toán ({selectedCount} sản phẩm):
                </div>
                <div className="fs-5 fw-semibold text-danger">
                  {currency(finalTotal)}
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
                onClick={handleProceedToOrder}
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
          <div className="mb-2 fw-semibold">Voucher có sẵn</div>
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            <ListGroup variant="flush" className="border rounded">
              {vouchers && vouchers.length > 0 ? (
                vouchers.map((v) => (
                  <ListGroup.Item key={v._id} className="py-3">
                    <Row className="g-3 align-items-center">
                      <Col xs="auto">
                        <div
                          className="rounded-2 border bg-light d-flex align-items-center justify-content-center"
                          style={{
                            width: 56,
                            height: 56,
                            fontWeight: 700,
                            fontSize: "1.5rem",
                          }}
                        >
                          {v.type === "percent" ? "%" : "₫"}
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
                ))
              ) : (
                <p className="p-3 text-center text-muted">
                  Không có voucher nào có sẵn.
                </p>
              )}
            </ListGroup>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
