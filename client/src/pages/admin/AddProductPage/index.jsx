// src/pages/admin/AddProductPage/index.jsx

import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, InputGroup, Image } from 'react-bootstrap'; 
import { FaBoxes, FaTags, FaDollarSign, FaImage, FaPlusCircle, FaTrash } from 'react-icons/fa';
import { mockBrands, mockCategories } from '../../../data/mockData';
import './AddProductPage.css';

const AddProductPage = () => {
    // State cho thông tin cơ bản của sản phẩm
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [mainImages, setMainImages] = useState([]); // Lưu trữ mảng file
    const [mainImagePreviews, setMainImagePreviews] = useState([]); // Lưu trữ mảng URL xem trước

    // State cho các biến thể (variants)
    const [variants, setVariants] = useState([
        { color: '', performance: '', importPrice: '', salePrice: '', image: null, imagePreview: '' }
    ]);

    const handleMainImagesChange = (e) => {
        const files = Array.from(e.target.files); // Chuyển FileList thành mảng
        if (files.length === 0) return;

        // Tạo các URL xem trước
        const newPreviews = files.map(file => URL.createObjectURL(file));

        // Thêm ảnh và ảnh xem trước mới vào state hiện có
        setMainImages(prevImages => [...prevImages, ...files]);
        setMainImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    };

    const removeMainImage = (indexToRemove) => {
        // Xóa khỏi mảng file
        setMainImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
        // Xóa khỏi mảng URL xem trước
        setMainImagePreviews(prevPreviews => {
            const urlToRemove = prevPreviews[indexToRemove];
            URL.revokeObjectURL(urlToRemove); // Giải phóng bộ nhớ cho URL cũ
            return prevPreviews.filter((_, index) => index !== indexToRemove);
        });
    };

    const handleVariantChange = (index, event) => {
        const values = [...variants];
        values[index][event.target.name] = event.target.value;
        setVariants(values);
    };

    const addVariant = () => {
        setVariants([...variants, { color: '', performance: '', importPrice: '', salePrice: '', image: null, imagePreview: '' }]);
    };

    const removeVariant = (index) => {
        const values = [...variants];
        values.splice(index, 1);
        setVariants(values);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const productData = {
            productName,
            description,
            brand,
            category,
            mainImages, // Ảnh chính
            createdAt: new Date().toISOString(),
            variants: variants.map(v => ({ // Chỉ lấy dữ liệu cần thiết, bỏ qua imagePreview
                color: v.color,
                performance: v.performance,
                importPrice: v.importPrice,
                salePrice: v.salePrice,
                image: v.image, // Ảnh của biến thể
            })),
        };

        console.log(productData);
        alert('Sản phẩm đã được thêm! (Kiểm tra console log)');
    };

    const handleVariantImageChange = (index, event) => {
        const file = event.target.files[0];
        if (file) {
            const newVariants = [...variants];
            newVariants[index].image = file;
            newVariants[index].imagePreview = URL.createObjectURL(file);
            setVariants(newVariants);
        }
    };

    return (
        <div className="p-4">
            <Form onSubmit={handleSubmit}>
                <Row>
                    {/* --- CỘT TRÁI: THÔNG TIN CƠ BẢN & ẢNH --- */}
                    <Col lg={8}>
                        {/* Card thông tin cơ bản */}
                        <Card className="card-custom mb-4">
                            <Card.Header>
                                <Card.Title as="h5">Thông tin cơ bản</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3" controlId="productName">
                                    <Form.Label>Tên sản phẩm</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="VD: Laptop Dell XPS 15"
                                        required
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="productDescription">
                                    <Form.Label>Mô tả</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        placeholder="Mô tả chi tiết về sản phẩm..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>

                        {/* Card hình ảnh */}
                        <Card className="card-custom mb-4">
                            <Card.Header>
                                <Card.Title as="h5"><FaImage className="me-2" /> Hình ảnh chính của sản phẩm</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                {/* ✨ INPUT FILE CHO PHÉP CHỌN NHIỀU ẢNH ✨ */}
                                <Form.Group controlId="productImages" className="mb-3">
                                    <Form.Label>Tải ảnh lên (có thể chọn nhiều ảnh)</Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        multiple // Thuộc tính quan trọng cho phép chọn nhiều file
                                        onChange={handleMainImagesChange}
                                    />
                                </Form.Group>

                                {/* ✨ KHU VỰC HIỂN THỊ CÁC ẢNH XEM TRƯỚC ✨ */}
                                {mainImagePreviews.length > 0 && (
                                    <div className="main-images-preview-container">
                                        {mainImagePreviews.map((previewUrl, index) => (
                                            <div key={index} className="main-image-preview-item">
                                                <Image src={previewUrl} thumbnail />
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="remove-image-btn"
                                                    onClick={() => removeMainImage(index)}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* --- CỘT PHẢI: PHÂN LOẠI --- */}
                    <Col lg={4}>
                        <Card className="card-custom mb-4">
                            <Card.Header>
                                <Card.Title as="h5"><FaTags className="me-2" /> Phân loại</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3" controlId="productCategory">
                                    <Form.Label>Danh mục</Form.Label>
                                    <Form.Select
                                        required
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {mockCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="productBrand">
                                    <Form.Label>Thương hiệu</Form.Label>
                                    <Form.Select
                                        required
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                    >
                                        <option value="">-- Chọn thương hiệu --</option>
                                        {mockBrands.map(brd => (
                                            <option key={brd.id} value={brd.id}>{brd.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* --- KHU VỰC BIẾN THỂ (VARIANTS) --- */}
                <Card className="card-custom mb-4">
                    <Card.Header>
                        <Card.Title as="h5"><FaBoxes className="me-2" /> Các biến thể sản phẩm</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        {variants.map((variant, index) => (
                            // ✨ BỌC MỖI BIẾN THỂ TRONG MỘT CARD RIÊNG ĐỂ GỌN GÀNG HƠN ✨
                            <Card key={index} className="variant-item mb-3">
                                <Card.Body>
                                    <Row className="align-items-center">
                                        {/* CỘT ẢNH CỦA BIẾN THỂ */}
                                        <Col md={2}>
                                            <Form.Group>
                                                <Form.Label>Ảnh biến thể</Form.Label>
                                                {variant.imagePreview ? (
                                                    <div className="variant-image-preview">
                                                        <Image src={variant.imagePreview} thumbnail />
                                                    </div>
                                                ) : (
                                                    <div className="variant-image-placeholder">
                                                        <FaImage size="2em" color="#ced4da" />
                                                    </div>
                                                )}
                                                <Form.Control
                                                    type="file"
                                                    accept="image/*"
                                                    className="mt-2"
                                                    size="sm"
                                                    onChange={e => handleVariantImageChange(index, e)}
                                                />
                                            </Form.Group>
                                        </Col>

                                        {/* CÁC CỘT THÔNG TIN CÒN LẠI */}
                                        <Col md={10}>
                                            <Row className="align-items-end">
                                                <Col md={4}>
                                                    <Form.Group>
                                                        <Form.Label>Màu sắc</Form.Label>
                                                        <Form.Control type="text" name="color" value={variant.color} onChange={e => handleVariantChange(index, e)} placeholder="VD: Bạc" />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Group>
                                                        <Form.Label>Hiệu năng</Form.Label>
                                                        <Form.Control type="text" name="performance" value={variant.performance} onChange={e => handleVariantChange(index, e)} placeholder="VD: 16GB RAM/512GB SSD" />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Group>
                                                        <Form.Label>Giá nhập</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control type="number" name="importPrice" value={variant.importPrice} onChange={e => handleVariantChange(index, e)} placeholder="30,000,000" />
                                                            <InputGroup.Text>đ</InputGroup.Text>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={4} className="mt-3">
                                                    <Form.Group>
                                                        <Form.Label>Giá bán</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control type="number" name="salePrice" value={variant.salePrice} onChange={e => handleVariantChange(index, e)} placeholder="45,000,000" required />
                                                            <InputGroup.Text>đ</InputGroup.Text>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={8} className="d-flex justify-content-end mt-3">
                                                    {variants.length > 1 && (
                                                        <Button variant="outline-danger" onClick={() => removeVariant(index)}>
                                                            <FaTrash className="me-1" /> Xóa biến thể
                                                        </Button>
                                                    )}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}
                        <Button variant="outline-primary" onClick={addVariant}>
                            <FaPlusCircle className="me-2" /> Thêm biến thể
                        </Button>
                    </Card.Body>
                </Card>

                {/* --- NÚT SUBMIT --- */}
                <div className="d-flex justify-content-end">
                    <Button variant="secondary" type="button" className="me-2">Hủy</Button>
                    <Button variant="primary" type="submit">Lưu sản phẩm</Button>
                </div>
            </Form>
        </div>
    );
};

export default AddProductPage;