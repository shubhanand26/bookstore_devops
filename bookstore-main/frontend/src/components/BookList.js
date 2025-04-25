import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

function BookList({
  books,
  handleAddToCart,
  adminMode,
  setSelectedBook,
  setShowModal,
  handleDelete,
}) {
  return (
    <Container>
      <Row>
        {books.map((book) => (
          <Col md={4} key={book.id}>
            <Card className="shadow mb-4 border-0">
              <Card.Body className="text-center">
                <Card.Title className="text-primary">{book.title}</Card.Title>
                <Card.Subtitle className="text-muted">
                  {book.author}
                </Card.Subtitle>
                <Card.Text className="mt-2 text-success fw-bold">
                  ${book.price}
                </Card.Text>

                {/* Add to Cart */}
                {!adminMode && (
                  <Button
                    variant="success"
                    onClick={() => handleAddToCart(book)}
                  >
                    🛒 Add to Cart
                  </Button>
                )}

                {/* Admin Controls */}
                {adminMode && (
                  <>
                    <Button
                      variant="warning"
                      onClick={() => {
                        setSelectedBook(book);
                        setShowModal(true);
                      }}
                    >
                      ✏️ Edit
                    </Button>{" "}
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(book.id)}
                    >
                      🗑 Delete
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default BookList;
