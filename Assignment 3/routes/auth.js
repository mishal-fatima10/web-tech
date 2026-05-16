const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { isLoggedIn } = require("../middleware/auth");

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

    req.flash("success", `Welcome back, ${user.name}!`);
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
  req.session.destroy((err) => {
    if (err) {
      req.flash("error", "Error during logout");
      return res.redirect("/");
    }
    req.flash("success", `${userName}, you have successfully logged out`);
    res.redirect("/");
  });
});

// Profile Page
router.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", { user: req.session });
});

module.exports = router;
