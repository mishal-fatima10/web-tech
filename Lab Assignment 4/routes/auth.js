const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { isLoggedIn } = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const Order = require("../models/Order");

// Register Page
router.get("/register", (req, res) => {
  res.render("register", { user: req.session.userId ? req.session : null });
});

// Register Logic
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // Validation
    if (!name || !email || !password || !passwordConfirm) {
      req.flash("error", "Please provide all required fields");
      return res.redirect("/register");
    }

    if (password !== passwordConfirm) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/register");
    }

    if (password.length < 6) {
      req.flash("error", "Password must be at least 6 characters");
      return res.redirect("/register");
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      req.flash("error", "Email is already in use");
      return res.redirect("/register");
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password
    });

    req.flash("success", "User registered successfully! Please login.");
    res.redirect("/login");
  } catch (error) {
    console.log("Registration error:", error.message);
    req.flash("error", error.message || "Error during registration");
    res.redirect("/register");
  }
});

// Login Page
router.get("/login", (req, res) => {
  res.render("login", { user: req.session.userId ? req.session : null });
});

// Login Logic
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      req.flash("error", "Please provide email and password");
      return res.redirect("/login");
    }

    // Find user and explicitly select password field
    const user = await User.findOne({ email: email }).select("+password");

    if (!user) {
      req.flash("error", "Email is not registered");
      return res.redirect("/login");
    }

    // Compare passwords
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/login");
    }

    // Store in session
    req.session.userId = user._id;
    req.session.name = user.name;
    req.session.email = user.email;
    req.session.role = user.role;

    // Also issue a JWT for API usage and set as a client-accessible cookie
    try {
      const payload = { user_id: user._id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
      // Set cookie accessible to JS (not httpOnly) so frontend can call protected API
      res.cookie("jwt", token, { maxAge: 60 * 60 * 1000, httpOnly: false });
    } catch (err) {
      console.warn("Could not create JWT for user login:", err.message);
    }

    req.flash("success", `Welcome back, ${user.name}!`);
    if (user.role === "admin") {
      return res.redirect("/admin");
    }

    res.redirect("/");
  } catch (error) {
    console.log("Login error:", error.message);
    req.flash("error", "Error during login");
    res.redirect("/login");
  }
});

// Logout Confirmation Page
router.get("/logout", isLoggedIn, (req, res) => {
  res.render("logout-confirm", { user: req.session });
});

// Logout Logic (After Confirmation)
router.post("/logout-confirm", isLoggedIn, (req, res) => {
  const userName = req.session.name;
  
  // Clear JWT cookie if set
  res.clearCookie("jwt");
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/");
    }
    res.redirect("/");
  });
});

// Profile Page
router.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", { user: req.session });
});

// Order confirmation page (shows product and qty, payment method)
router.get('/order/confirm', isLoggedIn, async (req, res) => {
  try {
    const productId = req.query.productId;
    const qty = parseInt(req.query.qty) || 1;
    if (!productId) return res.redirect('/products');
    const product = await Product.findById(productId);
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/products');
    }
    res.render('confirm-order', { user: req.session, product, qty });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load order confirmation');
    res.redirect('/products');
  }
});

// Submit confirmed order (server-side create using session)
router.post('/orders/confirm', isLoggedIn, async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const quantity = Math.max(1, parseInt(qty) || 1);
    const product = await Product.findById(productId);
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/products');
    }

    const totalPrice = product.price * quantity;
    const newOrder = await Order.create({
      user: req.session.userId,
      items: [{ product: product._id, quantity }],
      totalPrice,
      paymentMethod: 'cod'
    });

    req.flash('success', 'Order placed successfully (Cash on Delivery).');
    res.redirect('/orders');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error placing order');
    res.redirect('/products');
  }
});

// User Orders Page
router.get("/orders", isLoggedIn, async (req, res) => {
  try {
    const Order = require("../models/Order");
    const orders = await Order.find({ user: req.session.userId }).populate("items.product").sort({ createdAt: -1 });
    res.render("orders", { user: req.session, orders });
  } catch (err) {
    req.flash("error", "Could not load orders");
    res.redirect("/profile");
  }
});

module.exports = router;
