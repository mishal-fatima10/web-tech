const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/auth");

// Helper: build filters and pagination
function buildFilterAndOptions(query) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 8;
  const searchQuery = query.search || "";
  const categoryFilter = query.category || "";
  const minPrice = query.minPrice !== undefined && query.minPrice !== "" ? parseFloat(query.minPrice) : 0;
  const maxPrice = query.maxPrice !== undefined && query.maxPrice !== "" ? parseFloat(query.maxPrice) : Infinity;
  const sortBy = query.sort || "name";

  let filter = {};
  if (searchQuery) filter.name = { $regex: searchQuery, $options: "i" };
  if (categoryFilter) filter.category = categoryFilter;
  filter.price = { $gte: minPrice, $lte: maxPrice };

  let sortConfig = {};
  switch (sortBy) {
    case "price-low":
      sortConfig = { price: 1 };
      break;
    case "price-high":
      sortConfig = { price: -1 };
      break;
    case "rating":
      sortConfig = { rating: -1 };
      break;
    default:
      sortConfig = { name: 1 };
  }

  return { page, limit, filter, sortConfig };
}

// Public: GET /api/v1/products
router.get("/products", async (req, res) => {
  try {
    const { page, limit, filter, sortConfig } = buildFilterAndOptions(req.query);
    const skip = (page - 1) * limit;
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    const products = await Product.find(filter).sort(sortConfig).limit(limit).skip(skip);
    res.json({ products, page, totalPages, totalProducts, limit });
  } catch (err) {
    res.status(500).json({ error: "Error fetching products" });
  }
});

// Public: GET /api/v1/products/:id
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Error fetching product" });
  }
});

// Auth: POST /api/v1/auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await user.comparePassword(password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const payload = { user_id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, expiresIn: "1h" });
  } catch (err) {
    res.status(500).json({ error: "Error during authentication" });
  }
});

// Protected: POST /api/v1/orders
router.post("/orders", verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const items = req.body.items;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain items" });
    }

    // Fetch products and compute total
    let totalPrice = 0;
    const orderItems = [];
    for (const it of items) {
      const prod = await Product.findById(it.productId);
      if (!prod) return res.status(400).json({ error: `Product not found: ${it.productId}` });
      const qty = parseInt(it.quantity) || 1;
      totalPrice += prod.price * qty;
      orderItems.push({ product: prod._id, quantity: qty });
    }

    const newOrder = await Order.create({ user: userId, items: orderItems, totalPrice });
    res.status(201).json({ order: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating order" });
  }
});

// Protected: GET /api/v1/orders - return orders for authenticated user
router.get("/orders", verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    // If admin wants to pass ?all=true and has role admin, return all orders
    if (req.user.role === "admin" && req.query.all === "true") {
      const all = await Order.find().populate("items.product").sort({ createdAt: -1 });
      return res.json({ orders: all });
    }

    const orders = await Order.find({ user: userId }).populate("items.product").sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching orders" });
  }
});

// Protected: GET /api/v1/user/profile
router.get("/user/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Error fetching profile" });
  }
});

module.exports = router;
