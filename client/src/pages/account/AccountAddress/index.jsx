import { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateMe } from "../../../api/accountApi";
import { updateUserInState } from "../../../../features/auth/authSlice";
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

// Tạo id tăng dần đơn giản cho demo (hiện tại chỉ dùng 1 địa chỉ)
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
            <span className="fw-bold">
              {item.isDefault ? "Mặc định" : "Thiết lập mặc định"}
            </span>
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

function AddressForm({
  draft,
  setDraft,
  onSubmit,
  onCancel,
  mode = "create",
  vnData,
}) {
  const [error, setError] = useState("");

  // vnData có dạng:
  // { "Thành phố Hà Nội": { "Quận Ba Đình": ["Phường A", "Phường B", ...], ... }, ... }

  const provinces = useMemo(
    () => (vnData ? Object.keys(vnData) : []),
    [vnData]
  );

  const districts = useMemo(() => {
    if (!draft.province || !vnData) return [];
    return Object.keys(vnData[draft.province] || {});
  }, [draft.province, vnData]);

  const wards = useMemo(() => {
    if (!draft.province || !draft.district || !vnData) return [];
    return vnData[draft.province]?.[draft.district] || [];
  }, [draft.province, draft.district, vnData]);

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
        <div className="fw-bold mb-3 fs-5">
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

const mapUserAddressesToState = (user) => {
  const list = Array.isArray(user?.addresses) ? user.addresses : [];

  if (list.length === 0) return [];

  return list.map((addr, index) => ({
    id: addr._id || index + 1,
    fullName: addr.fullName || user.fullName || "",
    phone: addr.phoneNumber || user.phoneNumber || "",
    address: [addr.streetAddress, addr.ward, addr.district, addr.province]
      .filter(Boolean)
      .join(", "),
    houseNumber: addr.streetAddress || "",
    province: addr.province || "",
    district: addr.district || "",
    ward: addr.ward || "",
    isDefault: !!addr.isDefault,
  }));
};

export default function AccountAddress() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(emptyForm);
  const [mode, setMode] = useState("create"); // "create" | "edit"

  // Dữ liệu tỉnh/thành từ API
  const [vnData, setVnData] = useState(null);
  const [locLoading, setLocLoading] = useState(true);
  const [locError, setLocError] = useState("");

  // Fetch danh sách tỉnh/thành/quận/phường từ API public
  useEffect(() => {
    const fetchVNData = async () => {
      try {
        setLocLoading(true);
        setLocError("");

        const res = await fetch("https://provinces.open-api.vn/api/?depth=3");
        if (!res.ok) {
          throw new Error("Failed to fetch provinces");
        }
        const provinces = await res.json();

        const map = {};
        provinces.forEach((p) => {
          const districtMap = {};
          (p.districts || []).forEach((d) => {
            districtMap[d.name] = (d.wards || []).map((w) => w.name);
          });
          map[p.name] = districtMap;
        });

        setVnData(map);
      } catch (e) {
        console.error(e);
        setLocError("Không tải được danh sách tỉnh/thành. Vui lòng thử lại.");
      } finally {
        setLocLoading(false);
      }
    };

    fetchVNData();
  }, []);

  // Khi user thay đổi -> map địa chỉ từ user.address sang state local
  useEffect(() => {
    if (!user) return;
    setAddresses(mapUserAddressesToState(user));
  }, [user]);

  const sorted = useMemo(() => {
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

  const handleSubmit = async (data) => {
    let newList;

    if (mode === "edit") {
      // Cập nhật địa chỉ có id trùng với data.id
      newList = addresses.map((item) =>
        item.id === data.id ? { ...item, ...data } : item
      );
    } else {
      // Thêm địa chỉ mới
      const newId = nextId(addresses);
      const isDefault = addresses.length === 0; // địa chỉ đầu tiên mặc định
      newList = [
        ...addresses,
        {
          ...data,
          id: newId,
          isDefault,
        },
      ];
    }

    // Build payload cho backend: mảng addresses
    const addressesPayload = newList.map((item) => ({
      fullName: item.fullName,
      phoneNumber: item.phone,
      streetAddress: item.houseNumber,
      ward: item.ward,
      district: item.district,
      province: item.province,
      isDefault: item.isDefault,
    }));

    try {
      const res = await updateMe({ addresses: addressesPayload });
      const updatedUser = res.data.data;

      dispatch(updateUserInState(updatedUser));

      // Remap lại từ user trả về để đồng bộ _id, isDefault, v.v.
      setAddresses(mapUserAddressesToState(updatedUser));
      resetForm();
    } catch (err) {
      alert(
        err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Lưu địa chỉ thất bại."
      );
    }
  };

  const handleSetDefault = async (id) => {
    const newList = addresses.map((x) => ({
      ...x,
      isDefault: x.id === id,
    }));

    const addressesPayload = newList.map((item) => ({
      fullName: item.fullName,
      phoneNumber: item.phone,
      streetAddress: item.houseNumber,
      ward: item.ward,
      district: item.district,
      province: item.province,
      isDefault: item.isDefault,
    }));

    try {
      const res = await updateMe({ addresses: addressesPayload });
      const updatedUser = res.data.data;
      dispatch(updateUserInState(updatedUser));
      setAddresses(mapUserAddressesToState(updatedUser));
    } catch (err) {
      alert(
        err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Cập nhật địa chỉ mặc định thất bại."
      );
    }
  };

  const handleEdit = (item) => {
    const parsed =
      item.houseNumber || item.ward || item.district || item.province
        ? {}
        : parseAddressString(item.address);

    setDraft({ ...emptyForm, ...item, ...parsed });
    setMode("edit");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const target = addresses.find((x) => x.id === id);
    if (!target) return;
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    let newList = addresses.filter((x) => x.id !== id);

    // Đảm bảo vẫn có 1 địa chỉ mặc định nếu còn địa chỉ
    if (newList.length > 0 && !newList.some((a) => a.isDefault)) {
      newList[0].isDefault = true;
    }

    const addressesPayload = newList.map((item) => ({
      fullName: item.fullName,
      phoneNumber: item.phone,
      streetAddress: item.houseNumber,
      ward: item.ward,
      district: item.district,
      province: item.province,
      isDefault: item.isDefault,
    }));

    try {
      const res = await updateMe({ addresses: addressesPayload });
      const updatedUser = res.data.data;
      dispatch(updateUserInState(updatedUser));
      setAddresses(mapUserAddressesToState(updatedUser));
    } catch (err) {
      alert(
        err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Xóa địa chỉ thất bại."
      );
    }
  };

  if (locLoading) {
    return <div className="account-page">Đang tải danh sách tỉnh/thành...</div>;
  }

  return (
    <div className="account-page">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="mb-0">Địa chỉ của tôi</h5>
        <Button variant="danger" onClick={handleCreateClick}>
          {showForm ? "Đóng" : " + Thêm địa chỉ mới"}
        </Button>
      </div>

      {locError && (
        <Alert variant="danger" className="py-2">
          {locError}
        </Alert>
      )}

      {showForm && (
        <AddressForm
          draft={draft}
          setDraft={setDraft}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          mode={mode}
          vnData={vnData}
        />
      )}

      {sorted.length === 0 ? (
        <Alert variant="light" className="border" style={{ minHeight: 220 }}>
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
