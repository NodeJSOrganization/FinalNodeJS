import { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Button,
  Form,
  Image,
  InputGroup,
  Alert,
} from "react-bootstrap";

export default function AccountProfileEdit({
  initialProfile,
  onSave,
  onCancel,
}) {
  const [draft, setDraft] = useState(initialProfile);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  // Tách riêng phần chọn DOB để thao tác
  const [dobParts, setDobParts] = useState({ day: "", month: "", year: "" });

  const labelCls = "text-start mb-1 fw-semibold";

  useEffect(() => {
    setDraft(initialProfile);
    setPreviewUrl("");
    setError("");
    // Parse YYYY-MM-DD -> year, month, day
    if (initialProfile?.dateOfBirth) {
      const [y, m, d] = String(initialProfile.dateOfBirth).split("-");
      setDobParts({
        year: y || "",
        month: m || "",
        day: d || "",
      });
    } else {
      setDobParts({ day: "", month: "", year: "" });
    }
  }, [initialProfile]);

  // Helpers cho DOB
  const now = new Date();
  const currentYear = now.getFullYear();

  const isLeap = (y) =>
    Number.isInteger(+y) &&
    ((+y % 4 === 0 && +y % 100 !== 0) || +y % 400 === 0);

  const daysInMonth = (y, m) => {
    const mm = +m;
    if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(mm)) return 31;
    if ([1, 3, 5, 7, 8, 10, 12].includes(mm)) return 31;
    if ([4, 6, 9, 11].includes(mm)) return 30;
    // February
    return isLeap(+y) ? 29 : 28;
  };

  const years = useMemo(() => {
    const arr = [];
    for (let y = currentYear; y >= 1900; y--) arr.push(String(y));
    return arr;
  }, [currentYear]);

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")),
    []
  );
  const days = useMemo(() => {
    const max = daysInMonth(dobParts.year, dobParts.month);
    return Array.from({ length: max }, (_, i) =>
      String(i + 1).padStart(2, "0")
    );
  }, [dobParts.year, dobParts.month]);

  // Khi đổi 1 trong 3 select -> cập nhật dobParts và draft.dateOfBirth
  const updateDob = (patch) => {
    const next = { ...dobParts, ...patch };
    // Clamp ngày khi đổi tháng/năm
    const maxDay = daysInMonth(next.year, next.month);
    if (next.day && +next.day > maxDay)
      next.day = String(maxDay).padStart(2, "0");
    setDobParts(next);

    // Nếu đã đủ 3 phần -> set vào draft
    if (next.year && next.month && next.day) {
      const iso = `${next.year}-${next.month}-${next.day}`;
      setDraft((d) => ({ ...d, dateOfBirth: iso }));
    } else {
      setDraft((d) => ({ ...d, dateOfBirth: "" }));
    }
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError("Vui lòng chọn ảnh PNG hoặc JPEG.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("Kích thước ảnh tối đa 1MB.");
      return;
    }

    setError("");
    const dataUrl = await fileToDataUrl(file);
    setPreviewUrl(dataUrl);
    setDraft((d) => ({ ...d, avatarUrl: dataUrl }));
  };

  const validate = () => {
    if (!draft.fullName.trim()) return "Họ và tên không được để trống.";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email);
    if (!emailOk) return "Email không hợp lệ.";
    const phoneOk = /^[0-9\s+()-]{8,}$/.test(draft.phone);
    if (!phoneOk) return "Số điện thoại không hợp lệ.";

    // Nếu có DOB thì không được lớn hơn hôm nay
    if (draft.dateOfBirth) {
      const dob = new Date(draft.dateOfBirth + "T00:00:00");
      const today = new Date(now.toDateString());
      if (dob > today) return "Ngày sinh không được lớn hơn ngày hiện tại.";
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    onSave(draft);
  };

  const handleUsePoints = () => {
    alert(`Bạn có ${draft.loyaltyPoints.toLocaleString()} điểm để sử dụng.`);
  };

  const AvatarBlock = ({ url, name }) => (
    <div className="d-flex justify-content-center">
      {url ? (
        <Image
          src={url}
          roundedCircle
          alt="Avatar"
          width={128}
          height={128}
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div
          className="rounded-circle d-inline-flex align-items-center justify-content-center border"
          style={{
            width: 128,
            height: 128,
            background: "#f3f4f6",
            fontWeight: 700,
            fontSize: 28,
          }}
          aria-label="Chưa có ảnh đại diện"
        >
          {(name || "U N")
            .trim()
            .split(/\s+/)
            .map((w) => w[0]?.toUpperCase())
            .slice(0, 2)
            .join("")}
        </div>
      )}
    </div>
  );

  return (
    <div className="account-page">
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} className="text-start">
        <Row className="g-4">
          {/* Row avatar riêng, căn giữa */}
          <Col xs={12} className="text-center">
            <Form.Group controlId="avatarEdit">
              <Form.Label className="fw-semibold d-block mb-2">
                Ảnh đại diện
              </Form.Label>
              <AvatarBlock
                url={previewUrl || draft.avatarUrl}
                name={draft.fullName}
              />
              <div className="mt-3 d-inline-block text-start">
                <Form.Control
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleAvatarChange}
                />
                <Form.Text className="text-muted">
                  PNG/JPEG, tối đa 1MB
                </Form.Text>
              </div>
            </Form.Group>
          </Col>

          {/* Các nhãn khác ở dưới */}
          <Col xs={12}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3" controlId="fullName">
                  <Form.Label className={labelCls}>Họ và tên</Form.Label>
                  <Form.Control
                    value={draft.fullName}
                    onChange={(e) =>
                      setDraft({ ...draft, fullName: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label className={labelCls}>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={draft.email}
                    onChange={(e) =>
                      setDraft({ ...draft, email: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="phone">
                  <Form.Label className={labelCls}>Số điện thoại</Form.Label>
                  <InputGroup>
                    <Form.Control
                      value={draft.phone}
                      onChange={(e) =>
                        setDraft({ ...draft, phone: e.target.value })
                      }
                      placeholder="090..."
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* === Ngày sinh: 3 dropdown Năm / Tháng / Ngày === */}
              <Col md={6}>
                <Form.Group className="mb-3" controlId="dateOfBirth">
                  <Form.Label className={labelCls}>Ngày sinh</Form.Label>
                  <Row className="g-2">
                    <Col xs={12} sm={4}>
                      <Form.Select
                        aria-label="Năm sinh"
                        value={dobParts.year}
                        onChange={(e) => updateDob({ year: e.target.value })}
                      >
                        <option value="">Năm</option>
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col xs={12} sm={4}>
                      <Form.Select
                        aria-label="Tháng sinh"
                        value={dobParts.month}
                        onChange={(e) => updateDob({ month: e.target.value })}
                      >
                        <option value="">Tháng</option>
                        {months.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col xs={12} sm={4}>
                      <Form.Select
                        aria-label="Ngày sinh"
                        value={dobParts.day}
                        onChange={(e) => updateDob({ day: e.target.value })}
                        disabled={!dobParts.year || !dobParts.month}
                      >
                        <option value="">Ngày</option>
                        {days.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>
                  <Form.Text className="text-muted">
                    Vui lòng chọn đủ Năm, Tháng, Ngày.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="gender">
                  <Form.Label className={labelCls}>Giới tính</Form.Label>
                  <Form.Select
                    value={draft.gender || ""}
                    onChange={(e) =>
                      setDraft({ ...draft, gender: e.target.value })
                    }
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Loyalty Point: hiển thị + nút sử dụng */}
              <Col md={6}>
                <Form.Group className="mb-3" controlId="loyaltyPointsEditView">
                  <Form.Label className={labelCls}>Điểm thưởng</Form.Label>
                  <InputGroup>
                    <Form.Control
                      value={draft.loyaltyPoints.toLocaleString()}
                      readOnly
                      disabled
                      className="text-start bg-light"
                    />
                    <Button
                      variant="warning"
                      type="button"
                      onClick={handleUsePoints}
                    >
                      Sử dụng điểm
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-1 d-flex gap-2">
              <Button variant="danger" type="submit">
                Lưu
              </Button>
              <Button
                variant="outline-secondary"
                type="button"
                onClick={onCancel}
              >
                Hủy
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
