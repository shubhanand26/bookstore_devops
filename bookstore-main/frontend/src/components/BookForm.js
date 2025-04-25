import React, { useState, useEffect } from "react";
import { Form, Button, Modal } from "react-bootstrap";

function BookForm({ show, handleClose, book, handleSave }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author);
      setPrice(book.price);
    }
  }, [book]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave({ id: book?.id, title, author, price: parseFloat(price) });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{book ? "Edit Book" : "Add Book"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Author</Form.Label>
            <Form.Control
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="mt-3">
            {book ? "Update Book" : "Add Book"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default BookForm;
