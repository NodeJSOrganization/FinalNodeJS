import { Card } from "react-bootstrap";

const PaymentOfferCard = ({ backgroundImage, description = "", alt }) => {
  return (
    <div className="text-decoration-none" style={{ display: "block" }}>
      <Card
        className="h-100 border-0 shadow-sm rounded-3 overflow-hidden"
        style={{
          cursor: "pointer",
          transition: "transform 0.3s ease-in-out",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.transform = "translateY(-5px)")
        }
        onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        <Card.Img
          variant="top"
          src={backgroundImage}
          alt={alt || description}
          style={{
            height: "180px",
            objectFit: "cover",
          }}
        />
      </Card>
    </div>
  );
};

export default PaymentOfferCard;
