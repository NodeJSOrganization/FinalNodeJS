import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProductSampleData } from "../../data/ProductSampleData";
import { FaShoppingCart, FaStar } from "react-icons/fa";
import { Card, Carousel } from "react-bootstrap";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [comments, setComments] = useState([
    { id: 1, user: "User1", rating: 4, comment: "Sản phẩm tốt, đáng mua!" },
    { id: 2, user: "User2", rating: 5, comment: "Chất lượng tuyệt vời!" },
  ]);

  useEffect(() => {
    const foundProduct = Object.values(ProductSampleData)
      .flat()
      .find((p) => p.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);
      if (foundProduct.variants && foundProduct.variants.length > 0) {
        setSelectedVariant(0);
      }
    }
  }, [id]);

  const handleAddComment = (e) => {
    e.preventDefault();
    const newComment = {
      id: comments.length + 1,
      user: `User${comments.length + 1}`,
      rating: Math.floor(Math.random() * 5) + 1,
      comment: e.target.comment.value,
    };
    setComments([...comments, newComment]);
    e.target.reset();
  };

  if (!product)
    return <div className="container py-4">Sản phẩm không tồn tại.</div>;

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-primary">{product.name}</h2>
      <div className="row">
        <div className="col-md-6">
          <Card className="h-75 border-0 shadow-sm ">
            <Carousel interval={2000} controls indicators={false}>
              {product.images.map((img, index) => (
                <Carousel.Item key={index}>
                  <img
                    src={img}
                    className="card-img-top"
                    alt={`${product.name} - ${index}`}
                    style={{
                      height: "180px",
                      objectFit: "cover",
                    }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          </Card>
        </div>
        <div className="col-md-6">
          <p>
            <strong>Thương hiệu:</strong> {product.brand}
          </p>
          <p>
            <strong>Giá:</strong> {product.variants[selectedVariant].price}
          </p>
          {product.variants.length > 1 && (
            <div className="mb-3">
              <label>
                <strong>Biến thể:</strong>
              </label>
              <select
                className="form-select"
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
              >
                {product.variants.map((variant, index) => (
                  <option key={index} value={index}>
                    {variant.name} (Kho: {variant.stock})
                  </option>
                ))}
              </select>
            </div>
          )}
          <p>
            <strong>Mô tả:</strong>
          </p>
          <p>{product.description}</p>
          <button className="btn btn-primary mt-3">
            <FaShoppingCart /> Thêm vào giỏ
          </button>
        </div>
      </div>
      <div className="mt-5">
        <h3>Bình luận và Đánh giá</h3>
        <div className="mb-3">
          {comments.map((comment) => (
            <div key={comment.id} className="card mb-2">
              <div className="card-body">
                <h6>{comment.user}</h6>
                <div>
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      color={i < comment.rating ? "#ffc107" : "#e4e5e9"}
                    />
                  ))}
                </div>
                <p>{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddComment} className="mt-3">
          <div className="mb-3">
            <textarea
              className="form-control"
              name="comment"
              placeholder="Viết bình luận của bạn..."
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary">
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductDetail;
