import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  ListGroup,
  InputGroup,
  Alert,
} from "react-bootstrap";

//--- Demo dữ liệu ban đầu ---
const demoAddresses = [
  {
    id: 1,
    fullName: "Lê Công Tuấn",
    phone: "+84 918 047 901",
    address: "136/42/13, Nguyễn Thị Tần, Phường 2, Quận 8, TP. Hồ Chí Minh",
    isDefault: true,
  },
  {
    id: 2,
    fullName: "Đoàn Cẩm Thúy",
    phone: "+84 359 514 253",
    address: "Số 111, Đường 47, Phường Tân Quy, Quận 7, TP. Hồ Chí Minh",
    isDefault: false,
  },
];

// Dữ liệu chọn Tỉnh/Quận/Phường (demo tối thiểu)
const VN_DATA = {
  "TP. Hồ Chí Minh": {
    "Quận 7": ["Phường Tân Quy", "Phường Tân Phú", "Phường Bình Thuận"],
    "Quận 8": ["Phường 2", "Phường 3", "Phường 4"],
  },
  "Hà Nội": {
    "Quận Ba Đình": ["Phường Kim Mã", "Phường Giảng Võ"],
    "Quận Hoàn Kiếm": ["Phường Tràng Tiền", "Phường Cửa Đô  ng"],
  },
};

// Tạo id tăng dần đơn giản cho demo
function nextId(list) {
  return (list?.reduce((m, i) => Math.max(m, i.id), 0) || 0) + 1;
}

const emptyForm = {
  id: 0,
  fullName: "",
  phone: "",
  houseNumber: "",
  province: "",
  district: "",
  ward: "",
  isDefault: false,
};

// Thử tách địa chỉ chuỗi thành 4 phần: số nhà, phường, quận, tỉnh
function parseAddressString(str) {
  if (!str) return { houseNumber: "", ward: "", district: "", province: "" };
  const parts = String(str)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 4) {
    const province = parts[parts.length - 1];
    const district = parts[parts.length - 2];
    const ward = parts[parts.length - 3];
    const houseNumber = parts.slice(0, parts.length - 3).join(", ");
    return { houseNumber, ward, district, province };
  }
  return { houseNumber: str, ward: "", district: "", province: "" };
}

function AddressLine({ item, onSetDefault, onEdit, onDelete }) {
  return (
    <ListGroup.Item className="py-3">
      <Row className="g-2 align-items-start">
        <Col>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="fw-semibold">{item.fullName}</div>
            <div className="text-muted small">({item.phone})</div>
          </div>
          <div className="mt-1">{item.address}</div>
        </Col>

        <Col xs="auto" className="text-end">
          <Button
            size="sm"
            variant={item.isDefault ? "warning" : "light"}
            className="border me-2"
            disabled={item.isDefault}
            onClick={() => onSetDefault?.(item.id)}
          >
            {item.isDefault ? "Mặc định" : "Thiết lập mặc định"}
          </Button>

          <Button
            size="sm"
            variant="link"
            className="text-decoration-none me-2"
            onClick={() => onEdit?.(item)}
          >
            Cập nhật
          </Button>

          <Button
            size="sm"
            variant="link"
            className="text-decoration-none text-danger"
            onClick={() => onDelete?.(item.id)}
          >
            Xóa
          </Button>
        </Col>
      </Row>
    </ListGroup.Item>
  );
}

function AddressForm({ draft, setDraft, onSubmit, onCancel, mode = "create" }) {
  const [error, setError] = useState("");

  const provinces = useMemo(() => Object.keys(VN_DATA), []);
  const districts = useMemo(() => {
    return draft.province ? Object.keys(VN_DATA[draft.province] || {}) : [];
  }, [draft.province]);
  const wards = useMemo(() => {
    if (!draft.province || !draft.district) return [];
    return VN_DATA[draft.province]?.[draft.district] || [];
  }, [draft.province, draft.district]);

  const validate = () => {
    if (!draft.fullName.trim()) return "Vui lòng nhập tên người nhận.";
    const phoneOk = /^[0-9\s+()-]{8,}$/.test(draft.phone);
    if (!phoneOk) return "Số điện thoại không hợp lệ.";
    if (!draft.houseNumber.trim()) return "Vui lòng nhập số nhà/đường.";
    if (!draft.province) return "Vui lòng chọn Tỉnh/Thành phố.";
    if (!draft.district) return "Vui lòng chọn Quận/Huyện.";
    if (!draft.ward) return "Vui lòng chọn Phường/Xã.";
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) return setError(msg);
    setError("");
    const address = `${draft.houseNumber}, ${draft.ward}, ${draft.district}, ${draft.province}`;
    onSubmit?.({ ...draft, address });
  };

  return (
    <Card className="shadow-sm mb-3">
      <Card.Body>
        <div className="fw-semibold mb-3">
          {mode === "edit" ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
        </div>

        {error && (
          <Alert variant="danger" className="py-2">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit} className="text-start">
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="addr_fullName">
                <Form.Label className="fw-semibold mb-1">
                  Tên người nhận
                </Form.Label>
                <Form.Control
                  value={draft.fullName}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, fullName: e.target.value }))
                  }
                  placeholder="Ví dụ: Nguyễn Văn A"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="addr_phone">
                <Form.Label className="fw-semibold mb-1">
                  Số điện thoại
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    value={draft.phone}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, phone: e.target.value }))
                    }
                    placeholder="+84 9xx xxx xxx"
                    required
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="addr_house">
                <Form.Label className="fw-semibold mb-1">
                  Số nhà / Đường
                </Form.Label>
                <Form.Control
                  value={draft.houseNumber}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, houseNumber: e.target.value }))
                  }
                  placeholder="Ví dụ: 136/42/13 Nguyễn Thị Tần"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="addr_province">
                <Form.Label className="fw-semibold mb-1">
                  Tỉnh/Thành phố
                </Form.Label>
                <Form.Select
                  value={draft.province}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      province: e.target.value,
                      district: "",
                      ward: "",
                    }))
                  }
                  required
                >
                  <option value="">— Chọn —</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="addr_district">
                <Form.Label className="fw-semibold mb-1">Quận/Huyện</Form.Label>
                <Form.Select
                  value={draft.district}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      district: e.target.value,
                      ward: "",
                    }))
                  }
                  disabled={!draft.province}
                  required
                >
                  <option value="">— Chọn —</option>
                  {districts.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="addr_ward">
                <Form.Label className="fw-semibold mb-1">Phường/Xã</Form.Label>
                <Form.Select
                  value={draft.ward}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, ward: e.target.value }))
                  }
                  disabled={!draft.district}
                  required
                >
                  <option value="">— Chọn —</option>
                  {wards.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="mt-3 d-flex gap-2">
            <Button type="submit" variant="primary">
              {mode === "edit" ? "Lưu thay đổi" : "Thêm địa chỉ"}
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              onClick={onCancel}
            >
              Hủy
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default function AccountAddress({ initial = demoAddresses }) {
  const [addresses, setAddresses] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(emptyForm);
  const [mode, setMode] = useState("create"); // "create" | "edit"

  const sorted = useMemo(() => {
    // Luôn đưa mặc định lên trên
    return [...addresses].sort(
      (a, b) => Number(b.isDefault) - Number(a.isDefault)
    );
  }, [addresses]);

  const resetForm = () => {
    setDraft(emptyForm);
    setMode("create");
    setShowForm(false);
  };

  const handleCreateClick = () => {
    setDraft(emptyForm);
    setMode("create");
    setShowForm((v) => !v);
  };

  const handleSubmit = (data) => {
    if (mode === "create") {
      const payload = { ...data, id: nextId(addresses) };
      setAddresses((prev) => [payload, ...prev]);
    } else {
      setAddresses((prev) =>
        prev.map((x) => (x.id === data.id ? { ...x, ...data } : x))
      );
    }
    resetForm();
  };

  const handleSetDefault = (id) => {
    setAddresses((prev) => prev.map((x) => ({ ...x, isDefault: x.id === id })));
  };

  const handleEdit = (item) => {
    // Nếu item chưa có trường tách sẵn thì parse từ chuỗi address
    const parsed =
      item.houseNumber || item.ward || item.district || item.province
        ? {}
        : parseAddressString(item.address);

    setDraft({ ...emptyForm, ...item, ...parsed });
    setMode("edit");
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const target = addresses.find((x) => x.id === id);
    if (!target) return;
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    setAddresses((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="account-page">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="mb-0">Địa chỉ của tôi</h5>
        <Button variant="danger" onClick={handleCreateClick}>
          {showForm ? "Đóng" : " + Thêm địa chỉ mới"}
        </Button>
      </div>

      {/* Form thêm/cập nhật */}
      {showForm && (
        <AddressForm
          draft={draft}
          setDraft={setDraft}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          mode={mode}
        />
      )}

      {/* Danh sách địa chỉ */}
      {sorted.length === 0 ? (
        <Alert variant="light" className="border">
          Bạn chưa có địa chỉ nào.
        </Alert>
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            <ListGroup variant="flush text-start">
              {sorted.map((item) => (
                <AddressLine
                  key={item.id}
                  item={item}
                  onSetDefault={handleSetDefault}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
