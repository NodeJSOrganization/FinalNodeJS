// src/pages/AccountVoucher/index.jsx
import { useMemo } from "react";
import {
  Card,
  ListGroup,
  Row,
  Col,
  Button,
  Badge,
  Alert,
} from "react-bootstrap";

/**
 * Voucher shape (gợi ý):
 * {
 *   code: "SAVE10",
 *   discountType: "PERCENT" | "AMOUNT",
 *   discountValue: 10,
 *   usedCount: 3,
 *   usageLimit: 10, // optional
 *   description: "Giảm 10% cho đơn đầu tiên"
 * }
 */

function formatDiscount(v) {
  if (!v) return "";
  if (v.discountType === "PERCENT") return `${v.discountValue}%`;
  return `${Number(v.discountValue).toLocaleString("vi-VN")} đ`;
}

function TicketIcon({ label = "%" }) {
  return (
    <div
      className="rounded-2 d-inline-flex align-items-center justify-content-center border bg-light"
      style={{ width: 56, height: 56, fontWeight: 700, fontSize: 18 }}
      aria-label="Voucher icon"
    >
      {label}
    </div>
  );
}

function VoucherItem({ v, onCopy, onApply }) {
  const note = useMemo(() => {
    const discount = formatDiscount(v);
    const used = typeof v.usedCount === "number" ? v.usedCount : 0;
    const usage =
      typeof v.usageLimit === "number" ? `${used}/${v.usageLimit}` : `${used}`;
    return { discount, usage };
  }, [v]);

  return (
    <ListGroup.Item className="py-3">
      <Row className="g-3 align-items-start">
        <Col xs="auto">
          <TicketIcon label={v.discountType === "PERCENT" ? "%" : "₫"} />
        </Col>

        <Col xs={7} sm="auto" md={6} lg={6}>
          {/* Hàng tiêu đề + thông tin ngắn */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Badge bg="dark" className="fw-semibold" title="Mã voucher">
              {v.code}
            </Badge>
            <span className="text-muted small">•</span>
            <span className="fw-semibold">Giá giảm: {note.discount}</span>
            <span className="text-muted small">•</span>
            <span className="small">
              Số lượt sử dụng: <strong>{note.usage}</strong>
            </span>
          </div>

          {/* Mô tả */}
          {!!v.description && (
            <div className="text-muted mt-2 text-start">{v.description}</div>
          )}
        </Col>
        <Col>
          {/* Hàng riêng cho nút hành động */}
          <div className="d-flex justify-content-end gap-2 mt-2">
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => onCopy?.(v.code)}
              title="Sao chép mã"
            >
              Sao chép
            </Button>
            <Button
              size="sm"
              variant="warning"
              title="Áp dụng voucher"
              onClick={() => onApply?.(v)}
            >
              Áp dụng
            </Button>
          </div>
        </Col>
      </Row>
    </ListGroup.Item>
  );
}

export default function AccountVoucher({ vouchers, onApply }) {
  // Demo data nếu chưa truyền props
  const items = vouchers ?? [
    {
      code: "SAVE10",
      discountType: "PERCENT",
      discountValue: 10,
      usedCount: 2,
      usageLimit: 10,
      description: "Giảm 10% cho đơn đầu tiên của bạn.",
    },
    {
      code: "LAP50K",
      discountType: "AMOUNT",
      discountValue: 50000,
      usedCount: 0,
      description: "Giảm 50.000 đ cho đơn từ 1.000.000 đ.",
    },
    {
      code: "PHUKIEN15",
      discountType: "PERCENT",
      discountValue: 15,
      usedCount: 5,
      usageLimit: 10,
      description: "Áp dụng cho phụ kiện laptop.",
    },
    {
      code: "SAVE10",
      discountType: "PERCENT",
      discountValue: 10,
      usedCount: 2,
      usageLimit: 10,
      description: "Giảm 10% cho đơn đầu tiên của bạn.",
    },
    {
      code: "LAP50K",
      discountType: "AMOUNT",
      discountValue: 50000,
      usedCount: 0,
      description: "Giảm 50.000 đ cho đơn từ 1.000.000 đ.",
    },
    {
      code: "PHUKIEN15",
      discountType: "PERCENT",
      discountValue: 15,
      usedCount: 5,
      usageLimit: 10,
      description: "Áp dụng cho phụ kiện laptop.",
    },
  ];

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      alert(`Đã sao chép mã: ${code}`);
    } catch {
      alert("Không thể sao chép mã trên trình duyệt này.");
    }
  };

  return (
    <div className="account-page">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="mb-0">Voucher</h5>
        <Badge bg="danger" className="fs-6 px-3 py-2">
          Tổng: {items.length}
        </Badge>
      </div>

      {items.length === 0 ? (
        <Alert variant="light" className="border" style={{ minHeight: 220 }}>
          Bạn chưa có voucher nào.
        </Alert>
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            {/* Hộp cuộn riêng cho list (giảm từ 420 xuống 320) */}
            <div
              className="border-top"
              style={{
                maxHeight: 420,
                overflowY: "auto",
              }}
            >
              <ListGroup variant="flush">
                {items.map((v) => (
                  <VoucherItem
                    key={`${v.code}-${v.discountValue}`}
                    v={v}
                    onCopy={handleCopy}
                    onApply={onApply}
                  />
                ))}
              </ListGroup>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
