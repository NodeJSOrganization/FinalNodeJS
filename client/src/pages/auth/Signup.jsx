import Logo from "../../assets/images/logo_white_space.png";
import { useEffect, useState } from "react"; // <-- Thêm useEffect
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  InputGroup,
  FormControl,
  Alert,
  Spinner,
} from "react-bootstrap";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import axios from "axios";

// --- START: Cấu hình API địa chỉ ---
const API_HOST = "https://provinces.open-api.vn/api/";

const fetchAPI = async (endpoint) => {
  try {
    const response = await axios.get(API_HOST + endpoint);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API địa chỉ:", error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
};
// --- END: Cấu hình API địa chỉ ---


const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((s) => !s);

  // --- START: State cho việc lưu trữ dữ liệu địa chỉ từ API ---
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  // State cho việc loading các dropdown địa chỉ
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [wardsLoading, setWardsLoading] = useState(false);
  // --- END: State cho việc lưu trữ dữ liệu địa chỉ từ API ---

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    streetAddress: "",
    // Lưu cả code và name để dễ dàng xử lý
    province: "",
    district: "",
    ward: "",
    provinceCode: null,
    districtCode: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // --- START: useEffect để fetch dữ liệu địa chỉ ---

  // 1. Fetch danh sách Tỉnh/Thành phố khi component được mount
  useEffect(() => {
    const fetchProvinces = async () => {
      const provinceData = await fetchAPI("p/");
      setProvinces(provinceData);
    };
    fetchProvinces();
  }, []); // Dependency rỗng, chỉ chạy 1 lần

  // 2. Fetch danh sách Quận/Huyện khi Tỉnh/Thành phố thay đổi
  useEffect(() => {
    if (formData.provinceCode) {
      const fetchDistricts = async () => {
        setDistrictsLoading(true);
        const districtData = await fetchAPI(`p/${formData.provinceCode}?depth=2`);
        setDistricts(districtData.districts);
        setDistrictsLoading(false);
      };
      fetchDistricts();
    }
  }, [formData.provinceCode]); // Chạy lại khi provinceCode thay đổi

  // 3. Fetch danh sách Phường/Xã khi Quận/Huyện thay đổi
  useEffect(() => {
    if (formData.districtCode) {
      const fetchWards = async () => {
        setWardsLoading(true);
        const wardData = await fetchAPI(`d/${formData.districtCode}?depth=2`);
        setWards(wardData.wards);
        setWardsLoading(false);
      };
      fetchWards();
    }
  }, [formData.districtCode]); // Chạy lại khi districtCode thay đổi

  // --- END: useEffect để fetch dữ liệu địa chỉ ---


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- START: Cập nhật các hàm xử lý chọn địa chỉ ---
  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    const provinceName = e.target.options[e.target.selectedIndex].text;
    setFormData((prev) => ({
      ...prev,
      provinceCode: provinceCode,
      province: provinceCode ? provinceName : "",
      districtCode: null, // Reset quận/huyện và phường/xã khi tỉnh thay đổi
      district: "",
      ward: "",
    }));
    setDistricts([]); // Xóa danh sách quận/huyện cũ
    setWards([]); // Xóa danh sách phường/xã cũ
  };

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    const districtName = e.target.options[e.target.selectedIndex].text;
    setFormData((prev) => ({
      ...prev,
      districtCode: districtCode,
      district: districtCode ? districtName : "",
      ward: "", // Reset phường/xã khi quận/huyện thay đổi
    }));
    setWards([]); // Xóa danh sách phường/xã cũ
  };
  
  const handleWardChange = (e) => {
    const wardName = e.target.options[e.target.selectedIndex].text;
    setFormData((prev) => ({ ...prev, ward: e.target.value ? wardName : ""}));
  }
  // --- END: Cập nhật các hàm xử lý chọn địa chỉ ---


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password.length < 6) {
      return setError("Mật khẩu phải có ít nhất 6 ký tự.");
    }

    const payload = {
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      address: {
        streetAddress: formData.streetAddress,
        province: formData.province,
        district: formData.district,
        ward: formData.ward,
      },
    };

    try {
        setLoading(true);
        const response = await axios.post('/api/auth/register', payload);
        setSuccess(response.data.msg);
    } catch (err) {
        setError(err.response?.data?.msg || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
        setLoading(false);
    }
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
          
          {error && <Alert variant="danger" className="w-75">{error}</Alert>}
          {success && <Alert variant="success" className="w-75">{success}</Alert>}

          <Form className="w-75" onSubmit={handleSubmit}>
            {/* ... các Form.Group cho email, fullName, phoneNumber ... */}
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
            
            <Form.Group className="mb-3" controlId="formPhoneNumber">
              <Form.Control
                type="text"
                placeholder="Số điện thoại"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formStreetAddress">
              <Form.Control
                type="text"
                placeholder="Số nhà, tên đường (ví dụ: 12/34 Nguyễn Trãi)"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                required
              />
            </Form.Group>
            {/* --- END: các Form.Group ... --- */}


            {/* --- START: Cập nhật Dropdown địa chỉ --- */}
            <Row className="g-3 mb-3">
              <Col md={4}>
                <Form.Group controlId="formProvince">
                  <Form.Select
                    value={formData.provinceCode || ""}
                    onChange={handleProvinceChange}
                    required
                  >
                    <option value="">Tỉnh/Thành phố</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="formDistrict">
                  <Form.Select
                    value={formData.districtCode || ""}
                    onChange={handleDistrictChange}
                    required
                    disabled={!formData.provinceCode || districtsLoading}
                  >
                    <option value="">
                        {districtsLoading ? 'Đang tải...' : 'Quận/Huyện'}
                    </option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="formWard">
                  <Form.Select
                    name="ward"
                    value={formData.ward || ""}
                    onChange={handleWardChange}
                    required
                    disabled={!formData.districtCode || wardsLoading}
                  >
                     <option value="">
                        {wardsLoading ? 'Đang tải...' : 'Phường/Xã'}
                    </option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            {/* --- END: Cập nhật Dropdown địa chỉ --- */}


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

            <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Đang xử lý...
                </>
              ) : (
                "REGISTER"
              )}
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