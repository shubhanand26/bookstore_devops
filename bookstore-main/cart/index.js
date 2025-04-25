require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
app.use(express.json());
app.use(cors()); // ✅ Enable CORS for frontend access

const sequelize = new Sequelize(process.env.CART_DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

// ✅ Test DB Connection
async function startCartService() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully!");
    await sequelize.sync();
    console.log("🛒 Cart Service is running on port 5002");
    app.listen(5002);
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
}
startCartService();

// ✅ Cart Model
const Cart = sequelize.define("Cart", {
  bookId: { type: DataTypes.INTEGER, allowNull: false },
  title: DataTypes.STRING,
  author: DataTypes.STRING,
  price: DataTypes.FLOAT,
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
});

// ✅ GET: Health Check
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// ✅ GET: Liveness
app.get('/api/liveness', (req, res) => {
  res.status(200).send('Alive');
});

// ✅ GET: Fetch Cart Items
app.get("/api/cart", async (req, res) => {
  try {
    const cartItems = await Cart.findAll();
    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Error fetching cart items." });
  }
});

// ✅ DELETE: Clear Entire Cart (Checkout)
app.delete("/api/cart/clear", async (req, res) => {
  try {
    await Cart.destroy({ where: {} }); // Delete all cart items
    res.json({ message: "Cart cleared after checkout." });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Error during checkout." });
  }
});

// ✅ POST: Add a Book to Cart (Increase quantity if exists)
app.post("/api/cart", async (req, res) => {
  try {
    const { bookId, title, author, price } = req.body;
    if (!bookId || !title || !author || !price) {
      return res.status(400).json({ message: "Invalid book details." });
    }

    let cartItem = await Cart.findOne({ where: { bookId } });

    if (cartItem) {
      cartItem.quantity += 1;
      await cartItem.save();
      return res.json({ message: "Updated quantity in cart", cartItem });
    } else {
      cartItem = await Cart.create({
        bookId,
        title,
        author,
        price,
        quantity: 1,
      });
      return res.status(201).json({ message: "Added to cart", cartItem });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Error adding to cart." });
  }
});

// ✅ DELETE: Remove a Book (Decrease quantity or delete)
app.delete("/api/cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cartItem = await Cart.findByPk(id);
    if (!cartItem) return res.status(404).json({ message: "Item not found." });

    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      await cartItem.save();
      return res.json({ message: "Decreased quantity", cartItem });
    } else {
      await cartItem.destroy();
      return res.json({ message: "Item removed from cart." });
    }
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Error removing item from cart." });
  }
});
