import { useMemo, useState } from "react";
import { Card, Row, Col, Button, ProgressBar, Form } from "react-bootstrap";
import { FaStar } from "react-icons/fa";

const StarRating = ({ rating }) => (
  <div>
    {[...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        color={i < rating ? "#ffc107" : "#e4e5e9"}
        className="me-1"
      />
    ))}
  </div>
);

const ProductReviews = ({ reviews, productName, onAddReview, user }) => {
  const [filter, setFilter] = useState("all");

  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");

  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { total: 0, average: 0, counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const ratingReviews = reviews.filter((review) => review.rating > 0);
    const total = ratingReviews.length;
    const sum = ratingReviews.reduce((acc, review) => acc + review.rating, 0);
    const average = total > 0 ? (sum / total).toFixed(1) : 0;
    const counts = ratingReviews.reduce(
      (acc, review) => {
        if (review.rating) acc[review.rating] = (acc[review.rating] || 0) + 1;
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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const hasText = newComment.trim() !== "";
    const hasRating = newRating > 0;

    if (!hasText && !hasRating) {
      alert("Vui lòng viết bình luận hoặc chọn ít nhất 1 sao!");
      return;
    }
    if (hasRating && !user) {
      alert("Bạn cần đăng nhập để có thể đánh giá sao cho sản phẩm!");
      return;
    }
    if (!user && !authorName.trim()) {
      alert("Vui lòng nhập tên hiển thị của bạn!");
      return;
    }

    const reviewData = {
      ...(hasText && { text: newComment }),
      ...(hasRating && { rating: newRating }),
      ...(!user && { authorName: authorName }),
    };

    try {
      await onAddReview(reviewData);

      setNewRating(0);
      setNewComment("");
      setAuthorName("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg || "Gửi đánh giá thất bại. Vui lòng thử lại.";
      alert(errorMessage);
    }
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
              <div className="d-flex flex-column align-items-center">
                <StarRating rating={Math.round(stats.average) || 0} />
                <p className="text-muted mt-2 mb-0">
                  {stats.total} lượt đánh giá
                </p>
              </div>
            </Col>
            <Col md={8}>
              {Object.entries(stats.counts)
                .reverse()
                .map(([star, count]) => (
                  <div key={star} className="d-flex align-items-center mb-2">
                    <span className="me-2 text-nowrap">
                      {star} <FaStar color="#ffc107" size="0.9em" />
                    </span>
                    <ProgressBar
                      now={stats.total > 0 ? (count / stats.total) * 100 : 0}
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
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </Form.Group>

              {!user && (
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên hiển thị của bạn"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                  />
                </Form.Group>
              )}

              <Button type="submit" variant="primary">
                Gửi đánh giá
              </Button>
            </Form>
          </div>

          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <div key={review._id} className="border-bottom pb-3 mb-3">
                <div className="d-flex align-items-center mb-2">
                  {review.user?.avatar?.url ? (
                    <img
                      src={review.user.avatar.url}
                      alt={review.authorName}
                      className="rounded-circle me-3"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "40px",
                        height: "40px",
                        fontSize: "1.2rem",
                      }}
                    >
                      {review.authorName?.charAt(0).toUpperCase() || "Ẩn"}
                    </div>
                  )}
                  <div className="fw-bold">{review.authorName}</div>
                </div>
                <div className="ms-5">
                  {review.rating && <StarRating rating={review.rating} />}
                  <p className="mt-2 mb-1">{review.text}</p>
                  <small className="text-muted">
                    Đã đánh giá vào{" "}
                    {new Date(review.createdAt).toLocaleDateString()}
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
