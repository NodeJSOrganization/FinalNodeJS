import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { updateMe } from "../../../api/accountApi"; // chỉnh path cho đúng
import { Row, Col, Button, Form, Image, InputGroup } from "react-bootstrap";
import AccountProfileEdit from "./AccountProfileEdit/index.jsx";
import { updateUserInState } from "../../../../features/auth/authSlice.js"; // chỉnh path cho đúng

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

const emptyProfile = {
  avatarUrl: "",
  fullName: "",
  email: "",
  phone: "",
  loyaltyPoints: 0,
  dateOfBirth: "",
  gender: "",
};

const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("vi-VN");
};

export default function AccountProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // lấy user từ Redux

  const [profile, setProfile] = useState(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);

  const labelCls = "text-start mb-1 fw-semibold";

  // Khi user trong Redux thay đổi -> map sang profile local
  useEffect(() => {
    if (!user) return;

    setProfile({
      avatarUrl: user.avatar?.url || "",
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phoneNumber || "",
      loyaltyPoints: user.loyaltyPoints || 0,
      dateOfBirth: user.dateOfBirth || "",
      gender: user.gender || "",
    });
  }, [user]);

  // Fallback: nếu vì lý do gì đó chưa có user (AccountLayout chưa load xong)
  if (!user) {
    return <div className="account-page">Đang tải hồ sơ...</div>;
  }

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
          onSave={async (updated) => {
            try {
              const { avatarFile, ...rest } = updated;

              let res;
              if (avatarFile) {
                // Gửi dạng FormData để backend nhận được req.file
                const formData = new FormData();
                formData.append("fullName", rest.fullName);
                formData.append("phoneNumber", rest.phone);
                formData.append("gender", rest.gender);
                if (rest.dateOfBirth) {
                  formData.append("dateOfBirth", rest.dateOfBirth);
                }
                formData.append("avatar", avatarFile); // TÊN FIELD 'avatar' trùng upload.single('avatar')

                res = await updateMe(formData); // updateMe sẽ nhận FormData
              } else {
                // Không đổi avatar -> gửi JSON như cũ
                const payload = {
                  fullName: rest.fullName,
                  phoneNumber: rest.phone,
                  gender: rest.gender,
                  dateOfBirth: rest.dateOfBirth,
                };
                res = await updateMe(payload);
              }

              const updatedUser = res.data.data;

              dispatch(updateUserInState(updatedUser));

              setProfile((prev) => ({
                ...prev,
                avatarUrl: updatedUser.avatar?.url || prev.avatarUrl,
                fullName: updatedUser.fullName || rest.fullName,
                phone: updatedUser.phoneNumber || rest.phone,
                gender: updatedUser.gender || rest.gender,
                dateOfBirth: updatedUser.dateOfBirth || rest.dateOfBirth,
                loyaltyPoints: updatedUser.loyaltyPoints ?? prev.loyaltyPoints,
              }));

              setIsEditing(false);
            } catch (err) {
              alert(
                err?.response?.data?.msg ||
                  err?.response?.data?.message ||
                  "Cập nhật hồ sơ thất bại."
              );
            }
          }}
        />
      </>
    );
  }

  return (
    <div className="account-page">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="mb-0">Hồ sơ</h5>
        <Button variant="danger" onClick={() => setIsEditing(true)}>
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
