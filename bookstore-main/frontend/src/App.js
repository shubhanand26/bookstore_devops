import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Navbar,
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Modal,
} from "react-bootstrap";
import Footer from "./components/Footer";
import BookForm from "./components/BookForm";

function App() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [config, setConfigData] = useState(null);

  useEffect(() => {
    fetch('/config.json')  // Adjust path to match the location of the config file in the Nginx server
    .then(response => response.json())
    .then(data => {
      setConfigData(data);  // Store it in state
    })
    .catch(error => {
      console.error("Error loading config:", error);
    });
  }, []); // ✅ Set config data

  useEffect(() => {
    if (config) {
      // Fetch books once the configData is available
      fetchBooks();
      fetchCart();
    }
  }, [config]); // ✅ Fetch books & cart on component mount

  // ✅ Fetch Books
  const fetchBooks = () => {
    setLoading(true);
    fetch(`${config.REACT_APP_CATALOG_SERVICE_API_URL}/books`)
      .then((response) => response.json())
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
        setLoading(false);
      });
  };

  // ✅ Fetch Cart Items
  const fetchCart = () => {
    fetch(`${config.REACT_APP_CART_SERVICE_API_URL}/cart`)
      .then((response) => response.json())
      .then((data) => setCart(data))
      .catch((error) => console.error("Error fetching cart:", error));
  };

  // ✅ Admin Login
  const handleLogin = () => {
    if (adminPassword === "admin123") {
      setAdminMode(true);
      setAdminPassword(""); // Clear password field after login
    } else {
      alert("Incorrect admin password!");
    }
  };

  // ✅ Admin Logout
  const handleLogout = () => {
    setAdminMode(false);
  };

  // ✅ Add/Edit Book
  const handleSave = (book) => {
    const method = book.id ? "PUT" : "POST";
    const url = book.id
      ? `${config.REACT_APP_CATALOG_SERVICE_API_URL}/books/${book.id}`
      : `${config.REACT_APP_CATALOG_SERVICE_API_URL}/books`;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...book,
        adminPassword: "admin123",
      }),
    })
      .then(() => {
        fetchBooks();
        setShowModal(false);
      })
      .catch((error) => console.error("Error saving book:", error));
  };

  // ✅ Delete Book
  const handleDelete = (id) => {
    fetch(`${config.REACT_APP_CATALOG_SERVICE_API_URL}/books/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminPassword: "admin123" }),
    })
      .then(() => fetchBooks())
      .catch((error) => console.error("Error deleting book:", error));
  };

  // ✅ Add to Cart
  const handleAddToCart = (book) => {
    fetch(`${config.REACT_APP_CART_SERVICE_API_URL}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookId: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
      }),
    })
      .then(() => fetchCart())
      .catch((error) => console.error("Error adding to cart:", error));
  };

  // ✅ Remove from Cart
  const handleRemoveFromCart = (id) => {
    fetch(`${config.REACT_APP_CART_SERVICE_API_URL}/cart/${id}`, { method: "DELETE" })
      .then(() => fetchCart())
      .catch((error) => console.error("Error removing from cart:", error));
  };

  const handleCheckout = () => {
    // API Call to Clear Cart (if using backend to store cart items)
    fetch(`${config.REACT_APP_CART_SERVICE_API_URL}/cart/clear`, { method: "DELETE" })
      .then(() => {
        setCart([]); // Empty the cart state in frontend
        alert("✅ Payment successful! Thank you for your purchase."); // Success message
        setShowCartModal(false); // Close modal after checkout
      })
      .catch((error) => console.error("Error during checkout:", error));
  };

  return (
    <>
      {/* ✅ Navbar with Admin Login & Cart */}
      <Navbar bg="primary" variant="dark" className="shadow-lg">
        <Container>
          <Navbar.Brand href="#">📚 My Bookstore</Navbar.Brand>

          {/* ✅ Admin Login/Logout */}
          {!adminMode ? (
            <div className="d-flex">
              <Form.Control
                type="password"
                placeholder="Enter Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="me-2"
              />
              <Button variant="light" onClick={handleLogin}>
                🔑 Login
              </Button>
            </div>
          ) : (
            <Button variant="danger" onClick={handleLogout}>
              🚪 Logout
            </Button>
          )}

          {/* ✅ Cart Button */}
          <Button variant="warning" onClick={() => setShowCartModal(true)}>
            🛒 Cart ({cart.length})
          </Button>
        </Container>
      </Navbar>

      {/* ✅ Admin Controls (Show "Add Book" Button) */}
      {adminMode && (
        <Container className="text-center mt-3">
          <h5 className="text-danger">Admin Mode Enabled 🔥</h5>
          <Button
            variant="success"
            onClick={() => {
              setSelectedBook(null);
              setShowModal(true);
            }}
          >
            ➕ Add Book
          </Button>
        </Container>
      )}

      {/* ✅ Cart Modal */}
      <Modal show={showCartModal} onHide={() => setShowCartModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🛒 Your Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="d-flex justify-content-between">
                <span>
                  {item.title} - ${item.price} x {item.quantity}
                </span>
                <Button
                  variant="danger"
                  onClick={() => handleRemoveFromCart(item.id)}
                >
                  ❌ Remove
                </Button>
              </div>
            ))
          )}

          <div>
            <Button
              variant="success"
              onClick={handleCheckout}
              className="mt-3 w-100"
            >
              ✅ Checkout
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ✅ Book List */}
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Container>
          <Row>
            {books.map((book) => (
              <Col md={4} key={book.id}>
                <Card className="shadow mb-4 border-0">
                  <Card.Body className="text-center">
                    <Card.Title className="text-primary">
                      {book.title}
                    </Card.Title>
                    <Card.Subtitle className="text-muted">
                      {book.author}
                    </Card.Subtitle>
                    <Card.Text className="mt-2 text-success fw-bold">
                      ${book.price}
                    </Card.Text>

                    {/* ✅ Add to Cart */}
                    <Button
                      variant="success"
                      onClick={() => handleAddToCart(book)}
                    >
                      🛒 Add to Cart
                    </Button>
                    {/* ✅ Admin Controls */}
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
      )}

      <BookForm
        show={showModal}
        handleClose={() => setShowModal(false)}
        book={selectedBook}
        handleSave={handleSave}
      />
      <Footer />
    </>
  );
}

export default App;
