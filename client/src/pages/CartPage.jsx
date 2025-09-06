// src/pages/Cart/index.jsx
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
  Collapse,
  Card,
} from "react-bootstrap";

// ===== Helpers =====
const currency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Math.max(0, Number(v) || 0)
  );

// Điểm thưởng: mặc định 1 điểm = 1,000đ (bạn đổi theo hệ thống thực tế)
const POINT_TO_VND = 1000;

// ===== Demo data (thay bằng data từ API của bạn) =====
const DEMO_ITEMS = [
  {
    id: "C001",
    checked: true,
    name: "Kệ bàn học kiêm kệ màn hình TopY decor",
    variant: "Sợi carbon 160*100cm",
    price: 1020000,
    qty: 1,
    image: "../../../public/images/products/product_test.png",
  },
  {
    id: "C002",
    checked: true,
    name: "Chuột không dây Logitech M331 Silent",
    variant: "Màu đen",
    price: 299000,
    qty: 2,
    image: "../../../public/images/products/product_test.png",
  },
  {
    id: "C003",
    checked: false,
    name: "SSD Samsung 980 1TB NVMe",
    variant: "M.2 PCIe 3.0",
    price: 1699000,
    qty: 1,
    image: "../../../public/images/products/product_test.png",
  },
  {
    id: "C004",
    checked: false,
    name: "SSD Samsung 9890 1TB NVMe",
    variant: "M.2 PCIe 4.0",
    price: 1699000,
    qty: 1,
    image: "../../../public/images/products/product_test.png",
  },
  {
    id: "C005",
    checked: false,
    name: "SSD Samsung 780 1TB NVMe",
    variant: "Trắng",
    price: 1699000,
    qty: 1,
    image: "../../../public/images/products/product_test.png",
  },
  {
    id: "C006",
    checked: false,
    name: "SSD Samsung 1TB NVMe",
    variant: "M.2 FD 3.0",
    price: 1699000,
    qty: 1,
    image: "../../../public/images/products/product_test.png",
  },
  {
    id: "C007",
    checked: false,
    name: "Chuột không dây Logitech M331 Silent",
    variant: "Màu đỏ",
    price: 1699000,
    qty: 1,
    image: "../../../public/images/products/product_test.png",
  },
  {
    id: "C008",
    checked: false,
    name: "Chuột không dây Logitech M341 Silent",
    variant: "Màu đỏ",
    price: 1699000,
    qty: 1,
    image: "../../../public/images/products/product_test.png",
  },
  {
    id: "C009",
    checked: false,
    name: "Chuột không dây Logitech M333331 Silent",
    variant: "Màu vàng",
    price: 1699000,
    qty: 1,
    image: "../../../public/images/products/product_test.png",
  },
  {
    id: "C010",
    checked: false,
    name: "Bàn phím cơ Logitech M331 Silent",
    variant: "Màu đen",
    price: 1699000,
    qty: 1,
    image: "../../../public/images/products/product_test.png",
  },
  {
    id: "C011",
    checked: false,
    name: "Bàn phím cơ Logitech M331 Silent",
    variant: "Màu xanh dương",
    price: 1699000,
    qty: 1,
    image: "../../../public/images/products/product_test.png",
  },
  {
    id: "C012",
    checked: false,
    name: "Bàn phím cơ Logitech M333331 Silent",
    variant: "Màu vàng",
    price: 1699000,
    qty: 1,
    image: "../../../public/images/products/product_test.png",
  },
];

const DEMO_VOUCHERS = [
  {
    code: "SAVE10",
    discountType: "PERCENT", // PERCENT | AMOUNT
    discountValue: 10,
    usageLimit: 10,
    description: "Giảm 10% cho đơn đầu tiên.",
  },
  {
    code: "LAP50K",
    discountType: "AMOUNT",
    discountValue: 50000,
    usageLimit: null,
    description: "Giảm 50.000đ cho đơn từ 1.000.000đ.",
  },
  {
    code: "PK15",
    discountType: "PERCENT",
    discountValue: 15,
    usageLimit: 5,
    description: "Áp dụng cho phụ kiện laptop.",
  },
  {
    code: "PK16",
    discountType: "PERCENT",
    discountValue: 15,
    usageLimit: 5,
    description: "Áp dụng cho phụ kiện laptop.",
  },
  {
    code: "PK17",
    discountType: "PERCENT",
    discountValue: 15,
    usageLimit: 5,
    description: "Áp dụng cho phụ kiện laptop.",
  },
  {
    code: "LAP60K",
    discountType: "AMOUNT",
    discountValue: 50000,
    usageLimit: null,
    description: "Giảm 50.000đ cho đơn từ 1.000.000đ.",
  },
  {
    code: "SAVE11",
    discountType: "PERCENT", // PERCENT | AMOUNT
    discountValue: 10,
    usageLimit: 10,
    description: "Giảm 10% cho đơn đầu tiên.",
  },
  {
    code: "SAVE12",
    discountType: "PERCENT", // PERCENT | AMOUNT
    discountValue: 10,
    usageLimit: 10,
    description: "Giảm 10% cho đơn đầu tiên.",
  },
  {
    code: "SAVE13",
    discountType: "PERCENT", // PERCENT | AMOUNT
    discountValue: 10,
    usageLimit: 10,
    description: "Giảm 10% cho đơn đầu tiên.",
  },
  {
    code: "SAVE14",
    discountType: "PERCENT", // PERCENT | AMOUNT
    discountValue: 10,
    usageLimit: 10,
    description: "Giảm 10% cho đơn đầu tiên.",
  },
  {
    code: "SAVE15",
    discountType: "PERCENT", // PERCENT | AMOUNT
    discountValue: 10,
    usageLimit: 10,
    description: "Giảm 10% cho đơn đầu tiên.",
  },
  {
    code: "SAVE16",
    discountType: "PERCENT", // PERCENT | AMOUNT
    discountValue: 10,
    usageLimit: 10,
    description: "Giảm 10% cho đơn đầu tiên.",
  },
];

export default function CartPage() {
  // ------ Search ------
  const [keyword, setKeyword] = useState("");

  // ------ Cart state ------
  const [items, setItems] = useState(DEMO_ITEMS);

  // ------ Voucher state ------
  const [voucherModal, setVoucherModal] = useState(false);
  const [vouchers] = useState(DEMO_VOUCHERS);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherCodeInput, setVoucherCodeInput] = useState("");

  // ------ Reward points ------
  const [userPoints] = useState(458); // ví dụ: 458 điểm ~ 458.000đ
  const [usePoints, setUsePoints] = useState(false);

  // ------ Breakdown panel ------
  const [showBreakdown, setShowBreakdown] = useState(false);

  // ====== Derived values ======
  const filteredItems = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return items;
    return items.filter(
      (x) =>
        x.name.toLowerCase().includes(k) || x.variant.toLowerCase().includes(k)
    );
  }, [items, keyword]);

  const allChecked = useMemo(
    () => items.length > 0 && items.every((x) => x.checked),
    [items]
  );

  const totalCount = items.length;
  const selectedCount = items.filter((x) => x.checked).length;

  const selectedSubtotal = useMemo(
    () =>
      items
        .filter((x) => x.checked)
        .reduce((s, it) => s + it.price * it.qty, 0),
    [items]
  );

  const voucherDiscount = useMemo(() => {
    if (!selectedVoucher) return 0;
    if (selectedVoucher.discountType === "AMOUNT") {
      return Math.min(selectedVoucher.discountValue, selectedSubtotal);
    }
    // PERCENT
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

  // ====== Handlers ======
  const toggleAll = (checked) =>
    setItems((prev) => prev.map((x) => ({ ...x, checked })));

  const toggleOne = (id, checked) =>
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, checked } : x)));

  const changeQty = (id, delta) =>
    setItems((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, qty: Math.max(1, x.qty + delta) } : x
      )
    );

  const removeOne = (id) => setItems((prev) => prev.filter((x) => x.id !== id));

  const removeSelected = () =>
    setItems((prev) => prev.filter((x) => !x.checked));

  const openVoucher = () => {
    setVoucherCodeInput("");
    setVoucherModal(true);
  };
  const closeVoucher = () => setVoucherModal(false);

  const applyVoucher = (v) => {
    setSelectedVoucher(v);
    setVoucherModal(false);
  };
  const clearVoucher = () => setSelectedVoucher(null);

  const applyVoucherByCode = () => {
    const found = vouchers.find(
      (v) => v.code.toLowerCase() === voucherCodeInput.trim().toLowerCase()
    );
    if (!found) {
      alert("Mã voucher không tồn tại trong ví của bạn.");
      return;
    }
    applyVoucher(found);
  };

  return (
    <Container className="py-3">
      {/* ===== Top Search ===== */}
      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Tìm trong giỏ hàng (tên sản phẩm, phân loại...)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button
          variant="outline-secondary"
          onClick={() => setKeyword((k) => k)}
        >
          Tìm
        </Button>
        {keyword && (
          <Button variant="outline-secondary" onClick={() => setKeyword("")}>
            Xóa
          </Button>
        )}
      </InputGroup>

      {/* ===== Select-all line (under search) ===== */}
      <div className="d-flex align-items-center gap-3 mb-2">
        <Form.Check
          type="checkbox"
          id="top-check-all"
          checked={allChecked}
          onChange={(e) => toggleAll(e.target.checked)}
          label="Chọn tất cả sản phẩm"
        />
      </div>

      {/* ===== Cart list ===== */}
      <Table responsive hover className="align-middle">
        <thead className="bg-light">
          <tr>
            <th style={{ width: 50 }} />
            <th className="text-start">Sản phẩm</th>
            <th className="text-end" style={{ width: 150 }}>
              Đơn giá
            </th>
            <th className="text-center" style={{ width: 180 }}>
              Số lượng
            </th>
            <th className="text-end" style={{ width: 170 }}>
              Số tiền
            </th>
            <th className="text-center" style={{ width: 100 }}>
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((it) => {
            const line = it.price * it.qty;
            return (
              <tr key={it.id}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={it.checked}
                    onChange={(e) => toggleOne(it.id, e.target.checked)}
                  />
                </td>
                <td>
                  <Row className="g-2 align-items-center">
                    <Col xs="auto">
                      <div className="border rounded p-1 bg-white">
                        <Image src={it.image} rounded width={72} height={72} />
                      </div>
                    </Col>
                    <Col className="text-start">
                      <div className="fw-semibold">{it.name}</div>
                      <div className="text-muted small">
                        Phân loại hàng: {it.variant}
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
                      onClick={() => changeQty(it.id, -1)}
                    >
                      −
                    </Button>
                    <Form.Control
                      value={it.qty}
                      readOnly
                      className="text-center"
                      style={{ width: 56 }}
                    />
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => changeQty(it.id, 1)}
                    >
                      +
                    </Button>
                  </div>
                </td>
                <td className="text-end text-danger fw-semibold">
                  {currency(line)}
                </td>
                <td className="text-center">
                  <Button
                    variant="link"
                    className="text-dark p-0 text-decoration-none"
                    onClick={() => removeOne(it.id)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            );
          })}

          {filteredItems.length === 0 && (
            <tr>
              <td colSpan={6} className="text-muted text-center py-5">
                Không có sản phẩm phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* ===== Sticky bottom bar ===== */}
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
          {/* Left: select all + total items + delete */}
          <Col md={5} className="d-flex align-items-center gap-3">
            <Form.Check
              type="checkbox"
              id="bottom-check-all"
              checked={allChecked}
              onChange={(e) => toggleAll(e.target.checked)}
              label="Chọn tất cả"
            />
            <span className="text-muted small">
              Tổng sản phẩm: <strong>{totalCount}</strong>
            </span>
            <Button
              variant="link"
              className="text-danger p-0 ms-2"
              onClick={removeSelected}
            >
              Xóa
            </Button>
          </Col>

          {/* Right: voucher + points + total + buy */}
          <Col md={7}>
            {/* Row 1: Voucher */}
            <div className="d-flex align-items-center gap-2 mb-3 justify-content-end">
              <Badge bg="danger">Voucher</Badge>
              {selectedVoucher ? (
                <>
                  <span className="small">
                    {selectedVoucher.code}{" "}
                    <strong>
                      {selectedVoucher.discountType === "PERCENT"
                        ? `- ${selectedVoucher.discountValue}%`
                        : `- ${currency(selectedVoucher.discountValue)}`}
                    </strong>
                  </span>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={openVoucher}
                  >
                    Đổi
                  </Button>
                  <Button size="sm" variant="secondary" onClick={clearVoucher}>
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

            {/* Row 2: Reward points */}
            <div className="d-flex align-items-center gap-2 mb-3 justify-content-end">
              <Form.Check
                type="checkbox"
                id="use-points"
                checked={usePoints}
                onChange={(e) => setUsePoints(e.target.checked)}
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

            {/* Row 3: Total + CTA */}
            <div className="d-flex align-items-center gap-3 justify-content-end">
              <div className="text-end">
                <div className="small">
                  Tổng cộng ({selectedCount} sản phẩm):
                  <Button
                    size="sm"
                    variant="link"
                    className="ps-1 pe-0 align-baseline"
                    onClick={() => setShowBreakdown((s) => !s)}
                  >
                    {showBreakdown ? "Ẩn" : "Chi tiết"}
                  </Button>
                </div>
                <div className="fs-5 fw-semibold text-danger">
                  {currency(payable)}
                </div>
                <div className="small text-muted">
                  Tiết kiệm {currency(savings)}
                </div>
              </div>
              <Button
                variant="danger"
                disabled={selectedCount === 0 || payable === 0}
              >
                Mua hàng
              </Button>
            </div>

            {/* Breakdown panel */}
            <Collapse in={showBreakdown}>
              <div className="mt-3">
                <Card className="shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <span>Tổng tiền hàng</span>
                      <span>{currency(selectedSubtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Voucher giảm giá</span>
                      <span className="text-danger">
                        -{currency(voucherDiscount)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Số điểm thưởng đã dùng</span>
                      <span className="text-danger">
                        -{currency(pointsAppliedVnd)}
                      </span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <span className="fw-semibold">Tiết kiệm</span>
                      <span className="text-danger fw-semibold">
                        -{currency(savings)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="fw-semibold">Tổng số tiền</span>
                      <span className="fw-semibold">{currency(payable)}</span>
                    </div>
                    <div className="text-end text-muted small mt-2">
                      Số tiền cuối cùng thanh toán
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Collapse>
          </Col>
        </Row>
      </div>

      {/* ===== Voucher Modal ===== */}
      <Modal show={voucherModal} onHide={closeVoucher} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chọn / Nhập mã voucher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <InputGroup>
              <Form.Control
                placeholder="Nhập mã voucher của bạn"
                value={voucherCodeInput}
                onChange={(e) => setVoucherCodeInput(e.target.value)}
              />
              <Button variant="dark" onClick={applyVoucherByCode}>
                OK
              </Button>
            </InputGroup>
          </div>

          <div className="mb-2 fw-semibold">Voucher của bạn</div>
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            <ListGroup variant="flush" className="border rounded">
              {vouchers.map((v) => (
                <ListGroup.Item key={v.code} className="py-3">
                  <Row className="g-3 align-items-center">
                    <Col xs="auto">
                      <div
                        className="rounded-2 border bg-light d-inline-flex align-items-center justify-content-center"
                        style={{ width: 56, height: 56, fontWeight: 700 }}
                      >
                        {v.discountType === "PERCENT" ? "%" : "₫"}
                      </div>
                    </Col>
                    <Col md>
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <Badge bg="dark">{v.code}</Badge>
                        <span className="text-muted small">•</span>
                        <span className="small">
                          Loại:{" "}
                          <strong>
                            {v.discountType === "PERCENT"
                              ? "PERCENT"
                              : "AMOUNT"}
                          </strong>
                        </span>
                        <span className="text-muted small">•</span>
                        <span className="small">
                          Giá trị:{" "}
                          <strong>
                            {v.discountType === "PERCENT"
                              ? `${v.discountValue}%`
                              : currency(v.discountValue)}
                          </strong>
                        </span>
                        {typeof v.usageLimit === "number" && (
                          <>
                            <span className="text-muted small">•</span>
                            <span className="small">
                              Giới hạn: <strong>{v.usageLimit}</strong>
                            </span>
                          </>
                        )}
                      </div>
                      {!!v.description && (
                        <div className="text-muted mt-1 small">
                          {v.description}
                        </div>
                      )}
                    </Col>
                    <Col xs="auto">
                      <Button variant="warning" onClick={() => applyVoucher(v)}>
                        Áp dụng
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeVoucher}>
            Trở lại
          </Button>
          <Button variant="dark" onClick={closeVoucher}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
