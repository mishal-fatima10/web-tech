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

module.exports = { isLoggedIn, isAdmin };
