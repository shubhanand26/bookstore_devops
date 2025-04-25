require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
app.use(express.json());
app.use(cors());

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: console.log,
});

const ADMIN_PASSWORD = "admin123"; // Change this for security

// ✅ Define the Book model
const Book = sequelize.define(
  "Book",
  {
    title: DataTypes.STRING,
    author: DataTypes.STRING,
    price: DataTypes.FLOAT,
    stock: DataTypes.INTEGER,
  },
  {
    tableName: "books",
  }
);

// ✅ Sync database before starting the server
async function startServer() {
  try {
    await sequelize.sync(); // Ensure DB is ready
    console.log("Database synced successfully!");
    app.listen(5001, () => console.log(`Catalog service running on port 5001`));
  } catch (error) {
    console.error("Database connection error:", error);
  }
}
startServer();

// ✅ GET: Health Check
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// ✅ GET: Liveness
app.get('/api/liveness', (req, res) => {
  res.status(200).send('Alive');
});

// ✅ GET: Fetch all books (Anyone can access)
app.get("/api/books", async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (error) {
    console.error("Database Query Error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ POST: Add a new book (Only Admin)
app.post("/api/books", async (req, res) => {
  try {
    const { title, author, price, stock, adminPassword } = req.body;
    if (adminPassword !== ADMIN_PASSWORD) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Only admins can add books" });
    }

    const newBook = await Book.create({
      title,
      author,
      price: parseFloat(price),
      stock: stock ? parseInt(stock) : 0,
    });

    res.status(201).json(newBook);
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ message: "Server error while adding book." });
  }
});

// ✅ PUT: Edit a book (Only Admin)
app.put("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, price, stock, adminPassword } = req.body;

    if (adminPassword !== ADMIN_PASSWORD) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Only admins can edit books" });
    }

    const book = await Book.findByPk(id);
    if (!book) return res.status(404).json({ message: "Book not found." });

    book.title = title || book.title;
    book.author = author || book.author;
    book.price = price != null ? parseFloat(price) : book.price;
    book.stock = stock != null ? parseInt(stock) : book.stock;

    await book.save();
    res.json(book);
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ message: "Server error while updating book." });
  }
});

// ✅ DELETE: Remove a book (Only Admin)
app.delete("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminPassword } = req.body;

    if (adminPassword !== ADMIN_PASSWORD) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Only admins can delete books" });
    }

    const book = await Book.findByPk(id);
    if (!book) return res.status(404).json({ message: "Book not found." });

    await book.destroy();
    res.json({ message: "Book deleted successfully." });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Server error while deleting book." });
  }
});
