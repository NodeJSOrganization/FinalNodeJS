import { useEffect } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchDistricts,
  fetchWards,
  resetDistrictAndWard,
  resetWard,
  updateShippingInfo,
} from "../../../features/order/orderReducer";

export default function AddressSelector() {
  const dispatch = useDispatch();

  const { shippingInfo, provinces, districts, wards, status } = useSelector(
    (state) => state.order
  );

  useEffect(() => {
    if (
      shippingInfo.provinceName &&
      provinces.length > 0 &&
      !shippingInfo.provinceCode
    ) {
      const selectedProvince = provinces.find(
        (p) => p.name === shippingInfo.provinceName
      );
      if (selectedProvince) {
        dispatch(
          updateShippingInfo({
            field: "provinceCode",
            value: selectedProvince.code,
          })
        );
        dispatch(fetchDistricts(selectedProvince.code));
      }
    }
  }, [
    shippingInfo.provinceName,
    provinces,
    dispatch,
    shippingInfo.provinceCode,
  ]);

  useEffect(() => {
    if (
      shippingInfo.districtName &&
      districts.length > 0 &&
      !shippingInfo.districtCode
    ) {
      const selectedDistrict = districts.find(
        (d) => d.name === shippingInfo.districtName
      );
      if (selectedDistrict) {
        dispatch(
          updateShippingInfo({
            field: "districtCode",
            value: selectedDistrict.code,
          })
        );
        dispatch(fetchWards(selectedDistrict.code));
      }
    }
  }, [
    shippingInfo.districtName,
    districts,
    dispatch,
    shippingInfo.districtCode,
  ]);

  useEffect(() => {
    if (shippingInfo.wardName && wards.length > 0 && !shippingInfo.wardCode) {
      const selectedWard = wards.find((w) => w.name === shippingInfo.wardName);
      if (selectedWard) {
        dispatch(
          updateShippingInfo({ field: "wardCode", value: selectedWard.code })
        );
      }
    }
  }, [shippingInfo.wardName, wards, dispatch, shippingInfo.wardCode]);

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    const provinceName = provinceCode
      ? e.target.options[e.target.selectedIndex].text
      : "";

    dispatch(resetDistrictAndWard());
    dispatch(
      updateShippingInfo({ field: "provinceCode", value: provinceCode })
    );
    dispatch(
      updateShippingInfo({ field: "provinceName", value: provinceName })
    );
    if (provinceCode) {
      dispatch(fetchDistricts(provinceCode));
    }
  };

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    const districtName = districtCode
      ? e.target.options[e.target.selectedIndex].text
      : "";

    dispatch(resetWard()); // Reset cấp dưới khi đổi huyện
    dispatch(
      updateShippingInfo({ field: "districtCode", value: districtCode })
    );
    dispatch(
      updateShippingInfo({ field: "districtName", value: districtName })
    );
    if (districtCode) {
      dispatch(fetchWards(districtCode));
    }
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const wardName = wardCode
      ? e.target.options[e.target.selectedIndex].text
      : "";
    dispatch(updateShippingInfo({ field: "wardCode", value: wardCode }));
    dispatch(updateShippingInfo({ field: "wardName", value: wardName }));
  };

  return (
    <Row className="g-3">
      <Col md={4}>
        <Form.Group>
          <Form.Label>
            Tỉnh/Thành phố <span className="text-danger">*</span>
          </Form.Label>
          <Form.Select
            value={shippingInfo.provinceCode || ""}
            onChange={handleProvinceChange}
            disabled={status.provinces === "loading"}
          >
            <option value="">
              {status.provinces === "loading"
                ? "Đang tải..."
                : "-- Chọn Tỉnh/Thành --"}
            </option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
      <Col md={4}>
        <Form.Group>
          <Form.Label>
            Quận/Huyện <span className="text-danger">*</span>
          </Form.Label>
          <Form.Select
            value={shippingInfo.districtCode || ""}
            onChange={handleDistrictChange}
            disabled={
              !shippingInfo.provinceCode || status.districts === "loading"
            }
          >
            <option value="">
              {status.districts === "loading"
                ? "Đang tải..."
                : "-- Chọn Quận/Huyện --"}
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
        <Form.Group>
          <Form.Label>
            Phường/Xã <span className="text-danger">*</span>
          </Form.Label>
          <Form.Select
            value={shippingInfo.wardCode || ""}
            onChange={handleWardChange}
            disabled={!shippingInfo.districtCode || status.wards === "loading"}
          >
            <option value="">
              {status.wards === "loading"
                ? "Đang tải..."
                : "-- Chọn Phường/Xã --"}
            </option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
    </Row>
  );
}
