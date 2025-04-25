import React from "react";
import { Modal, Button } from "react-bootstrap";

function CartModal({
  showCartModal,
  setShowCartModal,
  cart,
  handleRemoveFromCart,
}) {
  return (
    <Modal show={showCartModal} onHide={() => setShowCartModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>🛒 Your Cart</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="d-flex justify-content-between align-items-center mb-2"
            >
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
      </Modal.Body>
    </Modal>
  );
}

export default CartModal;
