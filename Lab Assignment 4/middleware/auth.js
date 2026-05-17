// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  req.flash("error", "Please log in first");
  res.redirect("/login");
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session.userId && req.session.role === "admin") {
    return next();
  }
  req.flash("error", "Access Denied. Admin access required.");
  res.redirect("/");
};

// JWT-based verifyToken middleware for API routes
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  // If bearer token present, verify it
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  }

  // Fallback: if session exists, use session-based user
  if (req.session && req.session.userId) {
    req.user = { user_id: req.session.userId, role: req.session.role };
    return next();
  }

  return res.status(401).json({ error: "Missing or malformed Authorization header" });
};

module.exports = { isLoggedIn, isAdmin, verifyToken };
