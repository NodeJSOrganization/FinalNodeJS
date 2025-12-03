// client/src/pages/AccountOrderHistory.jsx
import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { createOrderSummary } from "../../../../features/order/orderReducer.js";
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
  Modal,
} from "react-bootstrap";
import "../../../styles/AccountOrderHistory.css";
import AccountOrderDetail from "../AccountOrderDetail/index.jsx";
import {
  getMyOrders,
  cancelMyOrder,
  checkReorderStock,
} from "../../../api/orderApi.js";

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
    Math.max(0, Number(v) || 0)
  );

const formatDateTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN");
};

// 1 điểm = 1.000đ (theo mô tả Loyalty trong yêu cầu)
const POINT_VALUE = 1000;

const priceAfterDiscount = (it) =>
  (Number(it.priceOriginal) || 0) * (1 - (Number(it.discount) || 0));

const calcSubtotal = (order) =>
  order.items.reduce(
    (sum, it) => sum + priceAfterDiscount(it) * Number(it.qty || 0),
    0
  );

const calcPayable = (order) => {
  const subtotal = calcSubtotal(order);
  const shipping = Number(order.shippingFee || 0);
  const coupon = Number(order.couponDiscount || 0);
  const pointsValue = Number(order.pointsUsed || 0) * POINT_VALUE;
  return Math.max(0, subtotal + shipping - coupon - pointsValue);
};

export default function AccountOrderHistory() {
  const [activeTab, setActiveTab] = useState(STATUS.ALL);
  const [keyword, setKeyword] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); // đơn hàng đang thao tác (hủy, mua lại, đánh giá)
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reorderLoadingId, setReorderLoadingId] = useState(null);
  const [reorderErrors, setReorderErrors] = useState({});
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [reviewForm, setReviewForm] = useState({}); // { productId: { rating, text } }
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewedOrders, setReviewedOrders] = useState({});

  const auth = useSelector((state) => state.auth); // tuỳ slice, chỉnh nếu khác
  const token = auth?.token;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getMyOrders();
        const json = res.data;

        if (!json.success) {
          throw new Error(json.message || "Không thể lấy danh sách đơn hàng");
        }

        setOrders(json.data || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  // ====== Action handlers ======
  const handleCancel = async (order) => {
    const ok = window.confirm(
      `Bạn có chắc chắn muốn hủy đơn ${order.orderId}?`
    );
    if (!ok) return;

    try {
      const res = await cancelMyOrder(order._id);
      const json = res.data;

      if (!json.success) {
        throw new Error(json.msg || "Không thể hủy đơn hàng");
      }

      const updated = json.data;

      // Cập nhật list orders
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o))
      );

      // Nếu đang mở modal chi tiết cho đơn này thì cập nhật luôn
      setSelectedOrder((prev) =>
        prev && prev._id === updated._id ? updated : prev
      );
    } catch (err) {
      console.error(err);
      alert(err.message || "Có lỗi xảy ra khi hủy đơn hàng");
    }
  };

  const handleReorder = async (order) => {
    // 1. map order items -> orderItems gửi lên BE
    const orderItems = order.items.map((it) => ({
      product: it.productId,
      variant: {
        _id: it.variantId,
        name: it.name,
        variantName: it.variant,
        image: it.image,
        price: priceAfterDiscount(it),
        sku: "",
      },
      quantity: it.qty,
    }));

    try {
      setReorderLoadingId(order._id);

      // 2. gọi api check tồn kho
      await checkReorderStock(orderItems);

      // nếu tới đây là đủ hàng → clear lỗi cũ (nếu có)
      setReorderErrors((prev) => {
        const clone = { ...prev };
        delete clone[order._id];
        return clone;
      });

      // 3. nếu ok -> tạo summary + navigate như cũ
      const subtotal = calcSubtotal(order);
      const voucherDiscount = Number(order.couponDiscount || 0);
      const pointsDiscount = Number(order.pointsUsed || 0) * POINT_VALUE;
      const finalTotal = Math.max(
        0,
        subtotal - voucherDiscount - pointsDiscount
      );

      dispatch(
        createOrderSummary({
          orderItems,
          subtotal,
          voucherDiscount,
          pointsDiscount,
          finalTotal,
          selectedVoucher: order.couponCode
            ? {
                code: order.couponCode,
                type: "fixed_amount",
                value: voucherDiscount,
              }
            : null,
          usePoints: order.pointsUsed > 0,
        })
      );

      navigate("/order");
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        "Đơn này có sản phẩm đã hết hàng hoặc không đủ số lượng";

      // lưu lỗi lại theo order._id để render lên UI
      setReorderErrors((prev) => ({
        ...prev,
        [order._id]: msg,
      }));

      toast?.error ? toast.error(msg) : alert(msg);
    } finally {
      setReorderLoadingId(null);
    }
  };

  const handleReview = (order) => {
    // khởi tạo form review cho từng product trong đơn
    const initial = {};
    order.items.forEach((it) => {
      initial[it.productId] = {
        rating: 5, // default 5 sao
        text: "", // chưa có nhận xét
      };
    });

    setReviewForm(initial);
    setReviewingOrder(order);
  };

  const handleSubmitReviews = async () => {
    if (!reviewingOrder) return;

    try {
      setReviewSubmitting(true);

      const config = { headers: { "Content-Type": "application/json" } };
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }

      // tạo danh sách request cho những sản phẩm có rating / text
      const requests = reviewingOrder.items
        .map((it) => {
          const data = reviewForm[it.productId];
          if (!data) return null;

          const hasText = data.text && data.text.trim() !== "";
          const hasRating = data.rating && data.rating > 0;

          if (!hasText && !hasRating) {
            return null; // user không nhập gì → bỏ qua sản phẩm này
          }

          const body = {
            rating: data.rating,
            text: data.text,
          };

          return axios.post(
            `/api/v1/reviews/product/${it.productId}`,
            body,
            config
          );
        })
        .filter(Boolean);

      if (requests.length === 0) {
        toast.error("bạn chưa nhập đánh giá cho sản phẩm nào");
        return;
      }

      await Promise.all(requests);

      // đánh dấu đơn này đã được đánh giá
      setReviewedOrders((prev) => ({
        ...prev,
        [reviewingOrder._id]: true,
      }));

      toast.success("cảm ơn bạn đã đánh giá sản phẩm");
      setReviewingOrder(null); // đóng modal
    } catch (err) {
      console.error("lỗi gửi đánh giá:", err);
      const msg =
        err?.response?.data?.msg || "lỗi khi gửi đánh giá, vui lòng thử lại";
      toast.error(msg);
    } finally {
      setReviewSubmitting(false);
    }
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
      {loading && (
        <div className="text-center text-muted py-5">
          Đang tải danh sách đơn hàng...
        </div>
      )}

      {!loading && error && (
        <div className="text-center text-danger py-5">{error}</div>
      )}

      {!loading && !error && (
        <div className="d-flex flex-column gap-3">
          {filtered.map((order) => {
            const subtotal = calcSubtotal(order);
            const totalPayable = calcPayable(order);

            return (
              <Card key={order.orderId} className="shadow-sm">
                {/* Header - bấm để mở/đóng chi tiết */}
                <Card.Header
                  onClick={() => setSelectedOrder(order)}
                  role="button"
                  className="d-flex align-items-center justify-content-between"
                  style={{ cursor: "pointer" }}
                  title="Bấm để xem chi tiết đơn hàng"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="text-muted">Mã đơn: {order.orderId}</span>
                    <span className="text-muted small">
                      • Lập lúc: {formatDateTime(order.createdAt)}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg={STATUS_BADGE[order.status]}>
                      {STATUS_LABEL[order.status]}
                    </Badge>
                  </div>
                </Card.Header>

                {/* TÓM TẮT sản phẩm (như trước) */}
                <Card.Body className="pt-3 pb-0">
                  <ListGroup variant="flush">
                    {order.items.map((it) => (
                      <ListGroup.Item
                        key={it.variantId || it.productId}
                        className="px-0"
                      >
                        <Row className="g-3 align-items-center">
                          <Col xs={3} md={2}>
                            <div className="border rounded p-1 bg-light">
                              <Image
                                src={it.image}
                                alt={it.name}
                                fluid
                                rounded
                              />
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
                                <i className="bi bi-truck"></i> Giao hàng thành
                                công
                              </div>
                            )}
                            {order.status === STATUS.SHIPPING && (
                              <div className="text-success small mt-1 text-start fw-semibold">
                                <i className="bi bi-truck"></i> Đang giao hàng
                              </div>
                            )}
                          </Col>
                          <Col xs={12} md={3} className="text-md-end">
                            <div className="text-decoration-line-through text-muted small">
                              {currency(it.priceOriginal)}
                            </div>
                            <div className="text-muted small">
                              <span className="text-danger fw-medium">
                                {currency(priceAfterDiscount(it))}
                              </span>
                            </div>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>

                {/* FOOTER tóm tắt tiền */}
                <Card.Footer className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-3">
                  <div className="ms-md-auto me-md-3">
                    <span className="me-2">Tạm tính:</span>
                    <span className="fw-semibold">{currency(subtotal)}</span>
                    <span className="text-muted mx-2">•</span>
                    <span className="me-2">Thành tiền:</span>
                    <span className="fs-5 fw-semibold text-danger">
                      {currency(totalPayable)}
                    </span>
                  </div>
                  <div className="d-flex flex-column align-items-end gap-1">
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
                          disabled={reorderLoadingId === order._id}
                        >
                          <span className="small">
                            {reorderLoadingId === order._id
                              ? "Đang kiểm tra..."
                              : "Mua lại"}
                          </span>
                        </Button>
                      )}

                      {order.status === STATUS.COMPLETED && (
                        <>
                          <Button
                            variant="danger"
                            onClick={() => handleReorder(order)}
                            disabled={reorderLoadingId === order._id}
                          >
                            <span className="small">
                              {reorderLoadingId === order._id
                                ? "Đang kiểm tra..."
                                : "Mua lại"}
                            </span>
                          </Button>
                          <Button
                            variant="outline-dark"
                            onClick={() => {
                              if (!reviewedOrders[order._id]) {
                                handleReview(order);
                              }
                            }}
                            disabled={!!reviewedOrders[order._id]}
                          >
                            <span className="small">
                              {reviewedOrders[order._id]
                                ? "Đã đánh giá"
                                : "Đánh giá sản phẩm"}
                            </span>
                          </Button>
                        </>
                      )}
                    </div>
                    {/* block hiển thị lỗi tồn kho */}
                    {reorderErrors[order._id] && (
                      <div className="text-danger small text-end">
                        {reorderErrors[order._id]}
                      </div>
                    )}
                  </div>
                </Card.Footer>
              </Card>
            );
          })}

          <AccountOrderDetail
            order={selectedOrder}
            show={!!selectedOrder}
            onHide={() => setSelectedOrder(null)}
            subtotal={selectedOrder ? calcSubtotal(selectedOrder) : 0}
            totalPayable={selectedOrder ? calcPayable(selectedOrder) : 0}
          />

          {filtered.length === 0 && (
            <div className="text-center text-muted py-5">
              Không tìm thấy đơn hàng phù hợp
            </div>
          )}
        </div>
      )}
      {/* popup đánh giá sản phẩm trong đơn */}
      {reviewingOrder && (
        <Modal
          show={!!reviewingOrder}
          onHide={() => setReviewingOrder(null)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Đánh giá sản phẩm trong đơn {reviewingOrder.orderId}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {reviewingOrder.items.map((it) => {
              const form = reviewForm[it.productId] || {};

              return (
                <Card key={it.variantId || it.productId} className="mb-3">
                  <Card.Body>
                    <div className="d-flex gap-3">
                      <Image
                        src={it.image}
                        alt={it.name}
                        style={{
                          width: 64,
                          height: 64,
                          objectFit: "cover",
                        }}
                        rounded
                      />
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{it.name}</div>
                        <div className="text-muted small mb-2">
                          phân loại: {it.variant} • x{it.qty}
                        </div>

                        <Form.Group className="mb-2">
                          <Form.Label className="small mb-1">
                            đánh giá sao
                          </Form.Label>
                          <Form.Select
                            value={form.rating || 5}
                            onChange={(e) =>
                              setReviewForm((prev) => ({
                                ...prev,
                                [it.productId]: {
                                  ...prev[it.productId],
                                  rating: Number(e.target.value),
                                },
                              }))
                            }
                          >
                            <option value={5}>5 sao</option>
                            <option value={4}>4 sao</option>
                            <option value={3}>3 sao</option>
                            <option value={2}>2 sao</option>
                            <option value={1}>1 sao</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group>
                          <Form.Label className="small mb-1">
                            nhận xét của bạn
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={form.text || ""}
                            onChange={(e) =>
                              setReviewForm((prev) => ({
                                ...prev,
                                [it.productId]: {
                                  ...prev[it.productId],
                                  text: e.target.value,
                                },
                              }))
                            }
                            placeholder="sản phẩm dùng có tốt không, ưu / nhược điểm..."
                          />
                        </Form.Group>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setReviewingOrder(null)}
              disabled={reviewSubmitting}
            >
              đóng
            </Button>
            <Button
              variant="danger"
              onClick={handleSubmitReviews}
              disabled={reviewSubmitting}
            >
              {reviewSubmitting ? "đang gửi..." : "gửi đánh giá"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
}
