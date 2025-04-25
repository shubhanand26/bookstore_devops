import React from "react";
import { Navbar, Container, Form, Button } from "react-bootstrap";

function Navigation({
  adminMode,
  adminPassword,
  setAdminPassword,
  handleLogin,
  handleLogout,
  cart,
  setShowCartModal,
}) {
  return (
    <Navbar bg="primary" variant="dark" className="shadow-lg">
      <Container>
        <Navbar.Brand href="#">📚 My Bookstore</Navbar.Brand>

        {/* Admin Login/Logout */}
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

        {/* Cart Button */}
        <Button variant="warning" onClick={() => setShowCartModal(true)}>
          🛒 Cart ({cart.length})
        </Button>
      </Container>
    </Navbar>
  );
}

export default Navigation;
