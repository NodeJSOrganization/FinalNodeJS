import { useEffect, useState } from "react";
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

  const labelCls = "text-start mb-1 fw-semibold";

  useEffect(() => {
    setDraft(initialProfile);
    setPreviewUrl("");
    setError("");
  }, [initialProfile]);

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
    <div className="text-start">
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
    <>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} className="text-start">
        <Row className="g-4">
          <Col md={3} xs={12}>
            <AvatarBlock
              url={previewUrl || draft.avatarUrl}
              name={draft.fullName}
            />

            <Form.Group controlId="avatarUpload" className="mt-3">
              <Form.Control
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleAvatarChange}
              />
              <Form.Text className="text-muted">PNG/JPEG, tối đa 1MB</Form.Text>
            </Form.Group>
          </Col>

          <Col md={9} xs={12}>
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

              {/* ⭐ Loyalty Point: chỉ hiển thị, không edit; dùng InputGroup để đồng bộ chiều cao */}
              <Col md={6}>
                <Form.Group className="mb-3" controlId="loyaltyPointsEditView">
                  <Form.Label className={labelCls}>Điểm thưởng</Form.Label>
                  <InputGroup>
                    <Form.Control
                      value={draft.loyaltyPoints.toLocaleString()}
                      readOnly
                      disabled
                      className="text-start"
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
              <Button variant="primary" type="submit">
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
    </>
  );
}
