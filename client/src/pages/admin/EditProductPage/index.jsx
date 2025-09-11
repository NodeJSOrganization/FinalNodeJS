// src/pages/admin/EditProductPage/index.jsx

import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Image, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaBoxes, FaTags, FaImage, FaPlusCircle, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
// Tái sử dụng CSS từ trang AddProductPage
import '../AddProductPage/AddProductPage.css';

const EditProductPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // State cho form
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');

    // State cho ảnh
    const [existingImages, setExistingImages] = useState([]); // Ảnh cũ từ server
    const [newImages, setNewImages] = useState([]); // File ảnh mới
    const [newImagePreviews, setNewImagePreviews] = useState([]); // Xem trước ảnh mới
    const [deletedCloudinaryIds, setDeletedCloudinaryIds] = useState([]); // ID ảnh cũ cần xóa

    // State cho biến thể
    const [variants, setVariants] = useState([]);

    // State phụ
    const [allBrands, setAllBrands] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch dữ liệu sản phẩm và dữ liệu phụ (brand, category)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, brandsRes, categoriesRes] = await Promise.all([
                    axios.get(`/api/v1/products/${id}`),
                    axios.get('/api/v1/brands'),
                    axios.get('/api/v1/categories')
                ]);

                const productData = productRes.data.data;
                setName(productData.name);
                setDescription(productData.description);
                setBrand(productData.brand._id);
                setCategory(productData.category._id);
                setExistingImages(productData.images || []);
                // Thêm imagePreview cho variant để hiển thị ảnh cũ
                setVariants(productData.variants.map(v => ({ ...v, imagePreview: v.image?.url || '', newImage: null })) || []);

                setAllBrands(brandsRes.data.data);
                setAllCategories(categoriesRes.data.data);

            } catch (err) {
                setError('Không thể tải dữ liệu sản phẩm.');
            } finally {
                setFetchLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Các hàm xử lý ảnh chính
    const handleNewImagesChange = (e) => {
        const files = Array.from(e.target.files);
        const previews = files.map(f => URL.createObjectURL(f));
        setNewImages(prev => [...prev, ...files]);
        setNewImagePreviews(prev => [...prev, ...previews]);
    };

    const removeNewImage = (index) => {
        URL.revokeObjectURL(newImagePreviews[index]);
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        const imageToRemove = existingImages[index];
        setDeletedCloudinaryIds(prev => [...prev, imageToRemove.cloudinary_id]);
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    // Các hàm xử lý biến thể
    const handleVariantChange = (index, event) => {
        const values = [...variants];
        values[index][event.target.name] = event.target.value;
        setVariants(values);
    };

    const handleVariantImageChange = (index, event) => {
        const file = event.target.files[0];
        if (file) {
            const newVariants = [...variants];
            // Xóa ảnh xem trước cũ nếu có
            if (newVariants[index].imagePreview && !newVariants[index].image?.url) {
                URL.revokeObjectURL(newVariants[index].imagePreview);
            }
            newVariants[index].newImage = file; // Lưu file mới vào một trường tạm
            newVariants[index].imagePreview = URL.createObjectURL(file);
            setVariants(newVariants);
        }
    };

    const addVariant = () => {
        setVariants([...variants, { color: '', performance: '', costPrice: '', sellingPrice: '', image: null, newImage: null, imagePreview: '' }]);
    };

    const removeVariant = (index) => {
        const variantToRemove = variants[index];
        if (variantToRemove.image?.cloudinary_id) {
            setDeletedCloudinaryIds(prev => [...prev, variantToRemove.image.cloudinary_id]);
        }
        if (variantToRemove.imagePreview && !variantToRemove.image?.url) {
            URL.revokeObjectURL(variantToRemove.imagePreview);
        }
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('brand', brand);
        formData.append('category', category);
        formData.append('deleted_cloudinary_ids', deletedCloudinaryIds.join(','));

        // Xử lý ảnh chính mới
        newImages.forEach(file => {
            formData.append('new_main_images', file);
        });

        // Xử lý biến thể
        const variantsPayload = variants.map((variant, index) => {
            const variantData = {
                _id: variant._id,
                color: variant.color,
                performance: variant.performance,
                costPrice: variant.costPrice,
                sellingPrice: variant.sellingPrice,
                image: variant.image,
                sku: variant.sku // ✨ THÊM DÒNG NÀY VÀO ✨
            };
            if (variant.newImage) {
                const imageIdentifier = `new_variant_image_${index}`;
                formData.append(imageIdentifier, variant.newImage);
                variantData.imageIdentifier = imageIdentifier;
            }
            return variantData;
        });

        formData.append('variants', JSON.stringify(variantsPayload));

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };

            await axios.put(`/api/v1/products/${id}`, formData, config);

            setSuccess('Cập nhật sản phẩm thành công! Đang chuyển hướng...');
            setTimeout(() => navigate('/admin/products'), 2000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Cập nhật sản phẩm thất bại.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return <div className="text-center p-5"><Spinner /></div>;

    return (
        <div className="p-4">
            <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Row>
                    <Col lg={8}>
                        <Card className="card-custom mb-4">
                            <Card.Header><Card.Title as="h5">Thông tin cơ bản</Card.Title></Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tên sản phẩm</Form.Label>
                                    <Form.Control type="text" required value={name} onChange={(e) => setName(e.target.value)} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mô tả</Form.Label>
                                    <Form.Control as="textarea" rows={5} required value={description} onChange={(e) => setDescription(e.target.value)} />
                                </Form.Group>
                            </Card.Body>
                        </Card>

                        <Card className="card-custom mb-4">
                            <Card.Header><Card.Title as="h5"><FaImage /> Hình ảnh sản phẩm</Card.Title></Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tải ảnh mới</Form.Label>
                                    <Form.Control type="file" accept="image/*" multiple onChange={handleNewImagesChange} />
                                </Form.Group>
                                <p className="text-muted">Ảnh hiện tại:</p>
                                <div className="main-images-preview-container">
                                    {existingImages.map((img, index) => (
                                        <div key={img.cloudinary_id} className="main-image-preview-item">
                                            <Image src={img.url} thumbnail />
                                            <Button variant="danger" size="sm" onClick={() => removeExistingImage(index)}><FaTrash /></Button>
                                        </div>
                                    ))}
                                    {newImagePreviews.map((preview, index) => (
                                        <div key={index} className="main-image-preview-item">
                                            <Image src={preview} thumbnail />
                                            <Button variant="danger" size="sm" onClick={() => removeNewImage(index)}><FaTrash /></Button>
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="card-custom mb-4">
                            <Card.Header><Card.Title as="h5"><FaTags /> Phân loại</Card.Title></Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label>Danh mục</Form.Label>
                                    <Form.Select required value={category} onChange={(e) => setCategory(e.target.value)}>
                                        <option value="">-- Chọn --</option>
                                        {allCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Thương hiệu</Form.Label>
                                    <Form.Select required value={brand} onChange={(e) => setBrand(e.target.value)}>
                                        <option value="">-- Chọn --</option>
                                        {allBrands.map(brd => <option key={brd._id} value={brd._id}>{brd.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Card className="card-custom mb-4">
                    <Card.Header><Card.Title as="h5"><FaBoxes /> Các biến thể</Card.Title></Card.Header>
                    <Card.Body>
                        {variants.map((variant, index) => (
                            <Card key={variant._id || index} className="variant-item mb-3">
                                <Card.Body>
                                    <Row>
                                        <Col md={2}>
                                            <Form.Group>
                                                <Form.Label>Ảnh</Form.Label>
                                                <Image src={variant.imagePreview || 'https://via.placeholder.com/150'} thumbnail />
                                                <Form.Control type="file" size="sm" className="mt-2" onChange={e => handleVariantImageChange(index, e)} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={10}>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>SKU</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="sku"
                                                            placeholder="VD: LNV-LOQ-XANH-32"
                                                            value={variant.sku || ''} // Hiển thị giá trị sku hoặc chuỗi rỗng
                                                            onChange={e => handleVariantChange(index, e)}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}><Form.Group><Form.Label>Màu sắc</Form.Label><Form.Control type="text" name="color" value={variant.color} onChange={e => handleVariantChange(index, e)} required /></Form.Group></Col>
                                                <Col md={6}><Form.Group><Form.Label>Hiệu năng</Form.Label><Form.Control type="text" name="performance" value={variant.performance} onChange={e => handleVariantChange(index, e)} required /></Form.Group></Col>
                                                <Col md={6} className="mt-3"><Form.Group><Form.Label>Giá nhập</Form.Label><Form.Control type="number" name="costPrice" value={variant.costPrice} onChange={e => handleVariantChange(index, e)} required /></Form.Group></Col>
                                                <Col md={6} className="mt-3"><Form.Group><Form.Label>Giá bán</Form.Label><Form.Control type="number" name="sellingPrice" value={variant.sellingPrice} onChange={e => handleVariantChange(index, e)} required /></Form.Group></Col>
                                            </Row>
                                            {variants.length > 1 && <Button variant="outline-danger" size="sm" className="mt-3" onClick={() => removeVariant(index)}><FaTrash /> Xóa</Button>}
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}
                        <Button variant="outline-primary" onClick={addVariant}><FaPlusCircle /> Thêm biến thể</Button>
                    </Card.Body>
                </Card>

                <div className="d-flex justify-content-end">
                    <Button variant="secondary" type="button" className="me-2" onClick={() => navigate('/admin/products')}>Hủy</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <><Spinner size="sm" /> Đang lưu...</> : 'Lưu thay đổi'}
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default EditProductPage;