import Logo from "../../assets/images/logo_white_space.png";
import { useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

// Demo dữ liệu Tỉnh/Thành -> Quận/Huyện -> Phường/Xã (rút gọn để minh hoạ)
const VN_ADDRESS = {
  "Hồ Chí Minh": {
    "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Đa Kao"],
    "Bình Thạnh": ["Phường 1", "Phường 2", "Phường 3"],
  },
  "Hà Nội": {
    "Hoàn Kiếm": ["Phường Hàng Bạc", "Phường Hàng Đào", "Phường Hàng Trống"],
    "Cầu Giấy": ["Phường Dịch Vọng", "Phường Nghĩa Tân", "Phường Quan Hoa"],
  },
  "Đà Nẵng": {
    "Hải Châu": ["Phường Hải Châu 1", "Phường Hải Châu 2"],
    "Sơn Trà": ["Phường An Hải Bắc", "Phường Phước Mỹ"],
  },
};

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((s) => !s);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    houseNumber: "", // Số nhà, tên đường
    province: "",
    district: "",
    ward: "",
  });

  const provinces = useMemo(() => Object.keys(VN_ADDRESS), []);
  const districts = useMemo(() => {
    if (!formData.province) return [];
    return Object.keys(VN_ADDRESS[formData.province] || {});
  }, [formData.province]);
  const wards = useMemo(() => {
    if (!formData.province || !formData.district) return [];
    return VN_ADDRESS[formData.province]?.[formData.district] || [];
  }, [formData.province, formData.district]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      province: value,
      district: "",
      ward: "",
    }));
  };
  const handleDistrictChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, district: value, ward: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const shippingAddress = [
      formData.houseNumber,
      formData.ward,
      formData.district,
      formData.province,
    ]
      .filter(Boolean)
      .join(", ");

    // TODO: call API đăng ký tại đây
    const payload = {
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      shippingAddress,
      // Có thể gửi kèm chi tiết nếu backend hỗ trợ:
      addressDetail: {
        houseNumber: formData.houseNumber,
        province: formData.province,
        district: formData.district,
        ward: formData.ward,
      },
    };

    console.log("SUBMIT SIGNUP:", payload);
    // Ví dụ: axios.post('/api/auth/signup', payload)
  };

  return (
    <Container
      fluid
      className="vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "linear-gradient(to right, #ffffff, #0d6efd)" }}
    >
      <Row
        style={{ maxWidth: "1400px", margin: "0 auto", borderRadius: "8px" }}
      >
        <Col
          md={6}
          className="d-flex flex-column justify-content-center align-items-center p-5 bg-white"
        >
          <img
            className="img-thumbnail d-block mb-2"
            style={{ width: "8rem", height: "6rem" }}
            src={Logo}
            alt="logo"
          />
          <h2 className="mt-3 mb-4 text-primary">Create New Account</h2>
          <p className="text-muted mb-4">Join our computer store today</p>

          <Form className="w-75" onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Control
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formFullName">
              <Form.Control
                type="text"
                placeholder="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* Địa chỉ giao hàng: Số nhà, Tỉnh/Thành, Quận/Huyện, Phường/Xã */}
            <Form.Group className="mb-3" controlId="formHouseNumber">
              <Form.Control
                type="text"
                placeholder="Số nhà, tên đường (ví dụ: 12/34 Nguyễn Trãi)"
                name="houseNumber"
                value={formData.houseNumber}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col md={4}>
                <Form.Group controlId="formProvince">
                  <Form.Select
                    value={formData.province}
                    onChange={handleProvinceChange}
                    required
                  >
                    <option value="">Tỉnh/Thành phố</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="formDistrict">
                  <Form.Select
                    value={formData.district}
                    onChange={handleDistrictChange}
                    required
                    disabled={!formData.province}
                  >
                    <option value="">Quận/Huyện</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="formWard">
                  <Form.Select
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    required
                    disabled={!formData.district}
                  >
                    <option value="">Phường/Xã</option>
                    {wards.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <InputGroup>
                <FormControl
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  name="password"
                  onChange={handleChange}
                  placeholder="Password"
                  required
                />
                <InputGroup.Text
                  onClick={togglePasswordVisibility}
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mb-3">
              REGISTER
            </Button>
          </Form>

          <p className="text-muted">
            Already have an account?{" "}
            <a href="/login" className="text-primary">
              LOG IN
            </a>
          </p>
        </Col>

        <Col
          md={6}
          className="d-flex flex-column justify-content-center p-5 text-white"
          style={{ background: "linear-gradient(to right, #0d6efd, #6610f2)" }}
        >
          <h1>Welcome to our Computer Store</h1>
          <p>
            Sign up to explore our wide range of high-performance computers and
            top-quality computer components. Discover the latest hardware to
            build your perfect system.
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default Signup;
