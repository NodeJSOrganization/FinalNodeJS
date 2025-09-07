import { Container, Row, Col } from "react-bootstrap";
import PaymentOfferCard from "./PaymentOfferCard";

const PaymentOffersSection = ({ heading, data }) => {
  return (
    <Container className="my-5">
      <h2 className="text-dark fw-bold mb-4" style={{ textAlign: "left" }}>
        {heading}
      </h2>
      <Row className="g-4">
        {" "}
        {data.map((offer) => (
          <Col xs={12} sm={6} md={4} lg={3} key={offer.id}>
            {" "}
            <PaymentOfferCard
              backgroundImage={offer.backgroundImage}
              description={offer.description}
              link={offer.link}
              alt={offer.alt}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default PaymentOffersSection;
