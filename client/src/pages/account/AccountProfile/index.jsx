import { useState } from "react";
import { Row, Col, Button, Form, Image, InputGroup } from "react-bootstrap";
import AccountProfileEdit from "./AccountProfileEdit/index.jsx";

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

const initialProfile = {
  avatarUrl: "",
  fullName: "Nguyễn Văn A",
  email: "nguyenvana@example.com",
  phone: "0901234567",
  loyaltyPoints: 1250,
  dateOfBirth: "", // YYYY-MM-DD
  gender: "", // "Nam" | "Nữ" | "Khác" | ""
};

const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("vi-VN");
};

export default function AccountProfile() {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);

  const labelCls = "text-start mb-1 fw-semibold";

  const handleUsePoints = () => {
    alert(`Bạn có ${profile.loyaltyPoints.toLocaleString()} điểm để sử dụng.`);
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
          {getInitials(name || "U N")}
        </div>
      )}
    </div>
  );

  if (isEditing) {
    return (
      <>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="mb-0">Hồ sơ</h5>
        </div>

        <AccountProfileEdit
          initialProfile={profile}
          onCancel={() => setIsEditing(false)}
          onSave={(updated) => {
            setProfile(updated);
            setIsEditing(false);
          }}
        />
      </>
    );
  }

  return (
    <div className="account-page">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="mb-0">Hồ sơ</h5>
        <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
          Chỉnh sửa
        </Button>
      </div>

      <Form className="text-start">
        <Row className="g-4">
          {/* Row avatar riêng, căn giữa */}
          <Col xs={12} className="text-center">
            <Form.Group controlId="avatarView">
              <Form.Label className="fw-semibold d-block mb-2">
                Ảnh đại diện
              </Form.Label>
              <AvatarBlock url={profile.avatarUrl} name={profile.fullName} />
            </Form.Group>
          </Col>

          {/* Các nhãn khác ở dưới */}
          <Col xs={12}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3" controlId="fullNameView">
                  <Form.Label className={labelCls}>Họ và tên</Form.Label>
                  <Form.Control
                    plaintext
                    readOnly
                    value={profile.fullName}
                    className="border rounded px-3 py-2 bg-light text-start"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="emailView">
                  <Form.Label className={labelCls}>Email</Form.Label>
                  <Form.Control
                    plaintext
                    readOnly
                    value={profile.email}
                    className="border rounded px-3 py-2 bg-light text-start"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="phoneView">
                  <Form.Label className={labelCls}>Số điện thoại</Form.Label>
                  <Form.Control
                    plaintext
                    readOnly
                    value={profile.phone}
                    className="border rounded px-3 py-2 bg-light text-start"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="dobView">
                  <Form.Label className={labelCls}>Ngày sinh</Form.Label>
                  <Form.Control
                    plaintext
                    readOnly
                    value={formatDate(profile.dateOfBirth)}
                    className="border rounded px-3 py-2 bg-light text-start"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="genderView">
                  <Form.Label className={labelCls}>Giới tính</Form.Label>
                  <Form.Control
                    plaintext
                    readOnly
                    value={profile.gender || ""}
                    className="border rounded px-3 py-2 bg-light text-start"
                  />
                </Form.Group>
              </Col>

              {/* Loyalty Point */}
              <Col md={6}>
                <Form.Group className="mb-3" controlId="loyaltyPointsView">
                  <Form.Label className={labelCls}>Điểm thưởng</Form.Label>
                  <InputGroup>
                    <Form.Control
                      value={profile.loyaltyPoints.toLocaleString()}
                      readOnly
                      disabled
                      className="text-start bg-light"
                    />
                    <Button variant="warning" onClick={handleUsePoints}>
                      Sử dụng điểm
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
