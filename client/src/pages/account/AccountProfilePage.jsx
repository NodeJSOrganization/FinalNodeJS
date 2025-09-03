import { useState, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
  Image,
  InputGroup,
} from "react-bootstrap";
import "../../styles/AccountProfilePage.css";

export default function AccountProfile() {
  const [form, setForm] = useState({
    username: "cngtun560",
    fullName: "Công Tuấn",
    email: "bi******@gmail.com",
    phone: "********01",
    gender: "male",
    birthday: "2004-01-01",
    avatarURL: "avatar.png",
  });

  const [avatarURL, setAvatarURL] = useState("");
  const [avatarError, setAvatarError] = useState(false);
  const fileRef = useRef(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onPickAvatar = () => fileRef.current?.click();

  const onAvatarSelected = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/image\/(jpeg|png)/.test(f.type)) {
      alert("Chỉ nhận JPEG hoặc PNG");
      return;
    }
    if (f.size > 1024 * 1024) {
      alert("Dung lượng tối đa 1MB");
      return;
    }
    const url = URL.createObjectURL(f);
    setAvatarURL(url);
  };

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: gọi API cập nhật hồ sơ ở đây
    alert("Đã lưu thay đổi (demo giao diện).");
  };

  return (
    <Container className="py-4">
      <Row>
        {/* Sidebar */}
        <Col lg={3} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body className="pb-2">
              <div className="d-flex align-items-center gap-2 mb-2">
                {form.avatarURL && !avatarError ? (
                  <img
                    src={form.avatarURL}
                    alt="avatar"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      objectFit: "cover",
                      background: "#f1f3f5",
                      display: "block",
                    }}
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#f1f3f5",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 600,
                      color: "#666",
                    }}
                  >
                    {form.fullName?.[0] || "U"}
                  </div>
                )}
                <div>
                  <div className="fw-semibold">{form.username}</div>
                  <a href="#!" className="small text-decoration-none">
                    Sửa Hồ Sơ
                  </a>
                </div>
              </div>
            </Card.Body>
            <ListGroup variant="flush">
              <ListGroup.Item className="fw-semibold" active>
                Tài Khoản Của Tôi
              </ListGroup.Item>
              <ListGroup.Item className="text-start">Giỏ hàng</ListGroup.Item>
              <ListGroup.Item className="text-start">Địa Chỉ</ListGroup.Item>
              <ListGroup.Item className="text-start">
                Chỉnh sửa hồ Sơ
              </ListGroup.Item>
              <ListGroup.Item className="text-start">
                Đổi Mật Khẩu
              </ListGroup.Item>
              <ListGroup.Item className="text-start">
                Kho Voucher
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        {/* Profile form */}
        <Col lg={9}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Hồ Sơ Của Tôi</h5>
              <p className="text-muted">
                Quản lý thông tin hồ sơ để bảo mật tài khoản
              </p>

              <Row className="g-4">
                <Col md={8}>
                  <Form onSubmit={handleSave}>
                    {/* Tên đăng nhập */}
                    <Form.Group className="mb-3">
                      <Form.Label>Tên đăng nhập</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={onChange}
                        placeholder="Tên đăng nhập"
                      />
                      <Form.Text className="text-muted">
                        Tên Đăng nhập chỉ có thể thay đổi một lần.
                      </Form.Text>
                    </Form.Group>

                    {/* Tên */}
                    <Form.Group className="mb-3">
                      <Form.Label>Tên</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={onChange}
                        placeholder="Họ và tên"
                      />
                    </Form.Group>

                    {/* Email + Thay đổi */}
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <InputGroup>
                        <Form.Control value={form.email} disabled readOnly />
                        <Button
                          variant="outline-primary"
                          onClick={() => alert("Flow đổi email (demo)")}
                        >
                          Thay Đổi
                        </Button>
                      </InputGroup>
                    </Form.Group>

                    {/* Phone + Thay đổi */}
                    <Form.Group className="mb-3">
                      <Form.Label>Số điện thoại</Form.Label>
                      <InputGroup>
                        <Form.Control value={form.phone} disabled readOnly />
                        <Button
                          variant="outline-primary"
                          onClick={() => alert("Flow đổi số điện thoại (demo)")}
                        >
                          Thay Đổi
                        </Button>
                      </InputGroup>
                    </Form.Group>

                    {/* Giới tính */}
                    <Form.Group className="mb-3">
                      <Form.Label className="me-3">Giới tính</Form.Label>
                      <Form.Check
                        inline
                        type="radio"
                        id="g-male"
                        name="gender"
                        label="Nam"
                        value="male"
                        checked={form.gender === "male"}
                        onChange={onChange}
                      />
                      <Form.Check
                        inline
                        type="radio"
                        id="g-female"
                        name="gender"
                        label="Nữ"
                        value="female"
                        checked={form.gender === "female"}
                        onChange={onChange}
                      />
                      <Form.Check
                        inline
                        type="radio"
                        id="g-other"
                        name="gender"
                        label="Khác"
                        value="other"
                        checked={form.gender === "other"}
                        onChange={onChange}
                      />
                    </Form.Group>

                    {/* Ngày sinh */}
                    <Form.Group className="mb-4">
                      <Form.Label>Ngày sinh</Form.Label>
                      <div className="d-flex align-items-center gap-2">
                        <Form.Control
                          type="date"
                          name="birthday"
                          value={form.birthday}
                          onChange={onChange}
                          style={{ maxWidth: 220 }}
                        />
                        <Button
                          variant="outline-primary"
                          onClick={() => alert("Flow đổi ngày sinh (demo)")}
                        >
                          Thay Đổi
                        </Button>
                      </div>
                    </Form.Group>

                    <Button type="submit" variant="danger" className="px-4">
                      Lưu
                    </Button>
                  </Form>
                </Col>

                {/* Avatar */}
                <Col md={4}>
                  <div className="d-flex flex-column align-items-center">
                    <div
                      style={{
                        width: 160,
                        height: 160,
                        borderRadius: "50%",
                        background: "#f1f3f5",
                        display: "grid",
                        placeItems: "center",
                        overflow: "hidden",
                        marginBottom: 16,
                      }}
                    >
                      {avatarURL ? (
                        <Image
                          src={avatarURL}
                          alt="avatar"
                          roundedCircle
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div className="text-muted">Ảnh</div>
                      )}
                    </div>

                    <Button variant="outline-secondary" onClick={onPickAvatar}>
                      Chọn Ảnh
                    </Button>
                    <Form.Control
                      ref={fileRef}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={onAvatarSelected}
                      className="d-none"
                    />

                    <div className="text-muted small mt-3 text-center">
                      Dung lượng file tối đa 1 MB
                      <br />
                      Định dạng: .JPEG, .PNG
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
