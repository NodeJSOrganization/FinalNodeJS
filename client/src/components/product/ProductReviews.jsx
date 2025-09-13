import { useMemo, useState } from "react";
import { Card, Row, Col, Button, ProgressBar, Form } from "react-bootstrap";
import { FaStar } from "react-icons/fa";

const StarRating = ({ rating }) => (
  <div className="">
    {[...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        color={i < rating ? "#ffc107" : "#e4e5e9"}
        className="me-1"
      />
    ))}
  </div>
);

const ProductReviews = ({ reviews, productName, onAddReview }) => {
  const [filter, setFilter] = useState("all");

  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { total: 0, average: 0, counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = (sum / total).toFixed(1);
    const counts = reviews.reduce(
      (acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    );
    return { total, average, counts };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (filter === "all") return reviews;
    return reviews.filter((r) => r.rating === parseInt(filter));
  }, [reviews, filter]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newRating || !newComment.trim()) {
      alert("Vui lòng chọn số sao và viết bình luận.");
      return;
    }

    const newReview = {
      id: Date.now(),
      user: "Khách Hàng",
      rating: newRating,
      comment: newComment,
    };

    onAddReview(newReview);

    setNewRating(0);
    setNewComment("");
  };

  const filterButtons = ["all", "5", "4", "3", "2", "1"];

  return (
    <div className="mt-5">
      <h3 className="mb-4">Đánh giá {productName}</h3>

      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4} className="text-center border-md-end mb-4 mb-md-0">
              <div className="d-flex justify-content-center align-items-baseline">
                <h1 className="display-4 fw-bold mb-0 me-2">{stats.average}</h1>
                <span className="fs-4 text-muted">/5</span>
              </div>
              <div className="flex ">
                <div className="flex items-center justify-center">
                  <StarRating rating={Math.round(stats.average)} />
                </div>
                <p className="text-muted mt-2 mb-3">
                  {stats.total} lượt đánh giá
                </p>
              </div>
            </Col>
            <Col md={8}>
              {Object.entries(stats.counts)
                .reverse()
                .map(([star, count]) => (
                  <div key={star} className="d-flex align-items-center mb-2">
                    <span className="me-2">
                      {star} <FaStar color="#ffc107" size="0.9em" />
                    </span>
                    <ProgressBar
                      now={(count / stats.total) * 100 || 0}
                      variant="warning"
                      className="flex-grow-1"
                      style={{ height: "8px" }}
                    />
                    <span
                      className="ms-3 text-muted"
                      style={{ minWidth: "80px" }}
                    >
                      {count} đánh giá
                    </span>
                  </div>
                ))}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <h5 className="mb-0 me-3">Lọc đánh giá theo</h5>
            {filterButtons.map((f) => (
              <Button
                key={f}
                variant={filter === f ? "primary" : "outline-secondary"}
                size="sm"
                onClick={() => setFilter(f)}
                className="rounded-pill px-3"
              >
                {f === "all" ? "Tất cả" : `${f} sao`}
              </Button>
            ))}
          </div>
        </Card.Header>
        <Card.Body>
          <div className="border-bottom pb-4 mb-4">
            <h5 className="mb-3">
              Chia sẻ trải nghiệm của bạn về sản phẩm này
            </h5>
            <Form onSubmit={handleSubmitReview}>
              <Form.Group className="mb-2">
                <Form.Label>Đánh giá của bạn:</Form.Label>
                <div>
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <FaStar
                        key={ratingValue}
                        size={25}
                        color={
                          ratingValue <= (hoverRating || newRating)
                            ? "#ffc107"
                            : "#e4e5e9"
                        }
                        onClick={() => setNewRating(ratingValue)}
                        onMouseEnter={() => setHoverRating(ratingValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{ cursor: "pointer", marginRight: "5px" }}
                      />
                    );
                  })}
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Sản phẩm dùng tốt không, bạn có hài lòng không?..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" variant="primary">
                Gửi đánh giá
              </Button>
            </Form>
          </div>

          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <div key={review.id} className="border-bottom pb-3 mb-3">
                <div className="d-flex align-items-center mb-2">
                  <div
                    className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "40px",
                      height: "40px",
                      fontSize: "1.2rem",
                    }}
                  >
                    {review.user.charAt(0).toUpperCase()}
                  </div>
                  <div className="fw-bold">{review.user}</div>
                </div>
                <div className="ms-5">
                  <StarRating rating={review.rating} />
                  <p className="mt-2 mb-1">{review.comment}</p>
                  <small className="text-muted">
                    Đã đánh giá vào 2 tháng trước
                  </small>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted py-4">
              Chưa có đánh giá nào phù hợp với lựa chọn của bạn.
            </p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductReviews;
