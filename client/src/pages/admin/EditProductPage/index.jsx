// src/pages/admin/EditProductPage/index.jsx

import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Image, Alert } from 'react-bootstrap';
import { FaBoxes, FaTags, FaImage, FaPlusCircle, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../../../../features/ui/uiSlice';
import '../AddProductPage/AddProductPage.css';

// Hằng số validation, giữ nhất quán với trang AddProductPage
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

const EditProductPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');

    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [deletedCloudinaryIds, setDeletedCloudinaryIds] = useState([]);

    const [variants, setVariants] = useState([]);
    const [allBrands, setAllBrands] = useState([]);
    const [allCategories, setAllCategories] = useState([]);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            dispatch(showLoading());
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
                setVariants(productData.variants.map(v => ({ ...v, imagePreview: v.image?.url || '', newImage: null })) || []);

                setAllBrands(brandsRes.data.data);
                setAllCategories(categoriesRes.data.data);

            } catch (err) {
                setError('Không thể tải dữ liệu sản phẩm.');
            } finally {
                dispatch(hideLoading());
            }
        };
        fetchData();
    }, [id, dispatch]);

    const validateFile = (file) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return `Định dạng file không hợp lệ. Vui lòng chỉ chọn file ảnh.`;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return `Kích thước ảnh quá lớn (${(file.size / 1024 / 1024).toFixed(2)}MB). Tối đa là ${MAX_FILE_SIZE_MB}MB.`;
        }
        return null;
    };

    const handleNewImagesChange = (e) => {
        setError('');
        const files = Array.from(e.target.files);
        const validFiles = [];
        const validPreviews = [];

        for (const file of files) {
            const errorMessage = validateFile(file);
            if (errorMessage) {
                setError(errorMessage);
                e.target.value = null;
                return;
            }
            validFiles.push(file);
            validPreviews.push(URL.createObjectURL(file));
        }

        setNewImages(prev => [...prev, ...validFiles]);
        setNewImagePreviews(prev => [...prev, ...validPreviews]);
        e.target.value = null;
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

    const handleVariantChange = (index, event) => {
        const values = [...variants];
        values[index][event.target.name] = event.target.value;
        setVariants(values);
    };

    const handleVariantImageChange = (index, event) => {
        setError('');
        const file = event.target.files[0];
        if (file) {
            const errorMessage = validateFile(file);
            if (errorMessage) {
                setError(errorMessage);
                event.target.value = null;
                return;
            }
            const newVariants = [...variants];
            if (newVariants[index].imagePreview && !newVariants[index].image?.url) {
                URL.revokeObjectURL(newVariants[index].imagePreview);
            }
            newVariants[index].newImage = file;
            newVariants[index].imagePreview = URL.createObjectURL(file);
            setVariants(newVariants);
        }
        event.target.value = null;
    };

    const addVariant = () => {
        setVariants([...variants, { color: '', performance: '', costPrice: '', sellingPrice: '', image: null, newImage: null, imagePreview: '', sku: '' }]);
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
        dispatch(showLoading());

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('brand', brand);
        formData.append('category', category);
        formData.append('deleted_cloudinary_ids', deletedCloudinaryIds.join(','));

        newImages.forEach(file => {
            formData.append('new_main_images', file);
        });

        const variantsPayload = variants.map((variant, index) => {
            const variantData = {
                _id: variant._id,
                color: variant.color,
                performance: variant.performance,
                costPrice: variant.costPrice,
                sellingPrice: variant.sellingPrice,
                image: variant.image,
                sku: variant.sku
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
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
            await axios.put(`/api/v1/products/${id}`, formData, config);
            setSuccess('Cập nhật sản phẩm thành công! Đang chuyển hướng...');
            setTimeout(() => navigate('/admin/products'), 2000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Cập nhật sản phẩm thất bại.');
        } finally {
            dispatch(hideLoading());
        }
    };

    return (
        <div className="p-4">
            <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
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
                                    <Form.Label>Tải ảnh mới (tối đa {MAX_FILE_SIZE_MB}MB mỗi ảnh)</Form.Label>
                                    <Form.Control type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} multiple onChange={handleNewImagesChange} />
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
                                                <Form.Control type="file" size="sm" className="mt-2" accept={ALLOWED_IMAGE_TYPES.join(',')} onChange={e => handleVariantImageChange(index, e)} />
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
                                                            value={variant.sku || ''}
                                                            onChange={e => handleVariantChange(index, e)}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}><Form.Group><Form.Label>Màu sắc</Form.Label><Form.Control type="text" name="color" value={variant.color} onChange={e => handleVariantChange(index, e)} required /></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mt-3"><Form.Label>Hiệu năng</Form.Label><Form.Control type="text" name="performance" value={variant.performance} onChange={e => handleVariantChange(index, e)} required /></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mt-3"><Form.Label>Giá nhập</Form.Label><Form.Control type="number" name="costPrice" value={variant.costPrice} onChange={e => handleVariantChange(index, e)} required /></Form.Group></Col>
                                                <Col md={6}><Form.Group className="mt-3"><Form.Label>Giá bán</Form.Label><Form.Control type="number" name="sellingPrice" value={variant.sellingPrice} onChange={e => handleVariantChange(index, e)} required /></Form.Group></Col>
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
                    <Button variant="primary" type="submit">
                        Lưu thay đổi
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default EditProductPage;